package br.com.vdevquest

import org.flywaydb.core.Flyway
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.BeforeAll
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.TestInstance
import org.junit.jupiter.api.assertDoesNotThrow
import org.testcontainers.containers.PostgreSQLContainer
import java.sql.DriverManager
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
}
