package br.com.vdevquest

import org.flywaydb.core.Flyway
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertDoesNotThrow
import org.testcontainers.containers.PostgreSQLContainer
import java.sql.DriverManager
import java.util.UUID
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class DatabaseMigrationIntegrationTest {
    private val postgres = PostgreSQLContainer("postgres:17-alpine")

    @BeforeAll
    fun migrate() {
        postgres.start()
        DriverManager.getConnection(postgres.jdbcUrl, postgres.username, postgres.password).use { connection ->
            connection.createStatement().use { statement ->
                statement.execute("create role vdev_app login password 'vdev_app' nosuperuser nocreatedb nocreaterole noinherit")
            }
        }
        Flyway.configure()
            .dataSource(postgres.jdbcUrl, postgres.username, postgres.password)
            .schemas("core", "quests", "avatar", "gamification", "private")
            .load()
            .migrate()
    }

    @AfterAll
    fun stop() = postgres.stop()

    @Test
    fun `migrations seed only level one and force RLS for application tables`() {
        DriverManager.getConnection(postgres.jdbcUrl, "vdev_app", "vdev_app").use { connection ->
            connection.createStatement().use { statement ->
                statement.executeQuery("select count(*) from gamification.levels where level = 1 and minimum_xp = 0").use { result ->
                    result.next()
                    assertEquals(1, result.getInt(1))
                }
                statement.executeQuery("select count(*) from core.users").use { result ->
                    result.next()
                    assertEquals(0, result.getInt(1), "RLS must hide records without a transaction context")
                }
                statement.executeQuery("select avatar::text from private.ranking_profiles() where name = 'Administradora local'").use { result ->
                    assertTrue(result.next())
                    assertTrue(result.getString(1).contains("bodyType"))
                    assertTrue(!result.getString(1).contains("admin@vdev.local"), "Public ranking must not expose email")
                }
            }
        }

        DriverManager.getConnection(postgres.jdbcUrl, "vdev_app", "vdev_app").use { connection ->
            connection.autoCommit = false
            connection.prepareStatement("select set_config('app.user_email', ?, true)").use { statement ->
                statement.setString(1, "admin@vdev.local")
                assertDoesNotThrow { statement.execute() }
            }
            connection.prepareStatement("select set_config('app.user_role', 'collaborator', true)").use { statement -> statement.execute() }
            connection.createStatement().use { statement ->
                statement.executeQuery("select email from core.users").use { result ->
                    assertTrue(result.next())
                    assertEquals("admin@vdev.local", result.getString(1))
                    assertTrue(!result.next())
                }
            }
            connection.rollback()
        }
    }

    @Test
    fun `collaborator can audit own invalidated mission but not another mission`() {
        val email = "historico-${UUID.randomUUID()}@vdev.local"
        val visibleId = UUID.randomUUID()
        val hiddenId = UUID.randomUUID()
        DriverManager.getConnection(postgres.jdbcUrl, postgres.username, postgres.password).use { connection ->
            connection.prepareStatement("insert into core.users(email, name, role) values (?, 'Histórico', 'collaborator')").use { statement ->
                statement.setString(1, email)
                statement.executeUpdate()
            }
            for (id in listOf(visibleId, hiddenId)) {
                connection.prepareStatement("""insert into quests.missions(id, slug, created_by_email, title, description, evidence_type, start_date, end_date, status, invalidated_at, invalidated_by_email)
                    values (?, ?, 'admin@vdev.local', 'Teste', 'Missão invalidada', 'text', date '2026-01-01', date '2026-12-31', 'invalidated', now(), 'admin@vdev.local')""").use { statement ->
                    statement.setObject(1, id)
                    statement.setString(2, "historico-${id}")
                    statement.executeUpdate()
                }
                connection.prepareStatement("insert into quests.mission_phases(mission_id, phase_number, phase_title, xp_reward) values (?, 1, 'Entrega', 10)").use { statement ->
                    statement.setObject(1, id)
                    statement.executeUpdate()
                }
            }
            connection.prepareStatement("insert into quests.submissions(id, mission_id, collaborator_email) values (?, ?, ?)").use { statement ->
                statement.setObject(1, UUID.randomUUID())
                statement.setObject(2, visibleId)
                statement.setString(3, email)
                statement.executeUpdate()
            }
        }

        DriverManager.getConnection(postgres.jdbcUrl, "vdev_app", "vdev_app").use { connection ->
            connection.autoCommit = false
            connection.prepareStatement("select set_config('app.user_email', ?, true)").use { statement ->
                statement.setString(1, email)
                statement.execute()
            }
            connection.createStatement().use { it.execute("select set_config('app.user_role', 'collaborator', true)") }
            connection.prepareStatement("select id from quests.missions where id in (?, ?)").use { statement ->
                statement.setObject(1, visibleId)
                statement.setObject(2, hiddenId)
                statement.executeQuery().use { result ->
                    assertTrue(result.next())
                    assertEquals(visibleId, result.getObject(1, UUID::class.java))
                    assertTrue(!result.next())
                }
            }
            connection.prepareStatement("select s.id from quests.submissions s join quests.missions m on m.id = s.mission_id where m.id = ?").use { statement ->
                statement.setObject(1, visibleId)
                statement.executeQuery().use { result ->
                    assertTrue(result.next(), "History join must retain an invalidated mission owned by the collaborator")
                    assertTrue(!result.next())
                }
            }
            connection.rollback()
        }
    }
}
