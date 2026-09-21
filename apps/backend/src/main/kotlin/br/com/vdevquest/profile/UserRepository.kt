package br.com.vdevquest.profile

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.ResultSet

enum class UserRole { collaborator, manager }

data class UserRecord(val email: String, val name: String, val xp: Long, val role: UserRole)
data class RecognitionBadge(val label: String, val imagePath: String)
data class Recognition(val activeTitle: String?, val badges: List<RecognitionBadge>)

@Repository
class UserRepository(private val jdbc: JdbcTemplate) {
    private val mapper = RowMapper { rs: ResultSet, _: Int ->
        UserRecord(
            email = rs.getString("email"),
            name = rs.getString("name"),
            xp = rs.getLong("xp"),
            role = UserRole.valueOf(rs.getString("role")),
        )
    }

    fun find(email: String): UserRecord? = jdbc.query("select email, name, xp, role from core.users where email = ?", mapper, email).firstOrNull()

    fun provision(email: String, name: String) {
        jdbc.update(
            "insert into core.users(email, name, role) values (?, ?, 'collaborator') on conflict (email) do nothing",
            email,
            name,
        )
    }

    fun updateName(email: String, name: String) {
        jdbc.update("update core.users set name = ? where email = ?", name, email)
    }

    fun levelFor(xp: Long): LevelRecord = jdbc.query(
        "select level, minimum_xp, label from gamification.levels where minimum_xp <= ? order by minimum_xp desc limit 1",
        RowMapper { rs, _ -> LevelRecord(rs.getShort("level").toInt(), rs.getLong("minimum_xp"), rs.getString("label")) },
        xp,
    ).single()

    fun nextLevelFor(xp: Long): LevelRecord? = jdbc.query(
        "select level, minimum_xp, label from gamification.levels where minimum_xp > ? order by minimum_xp limit 1",
        RowMapper { rs, _ -> LevelRecord(rs.getShort("level").toInt(), rs.getLong("minimum_xp"), rs.getString("label")) },
        xp,
    ).firstOrNull()

    fun recognitionFor(email: String): Recognition {
        val title = jdbc.query(
            """select title.label from gamification.user_titles user_title
               join gamification.titles title on title.id = user_title.title_id
               where user_title.user_email = ? and user_title.is_active""",
            RowMapper { rs, _ -> rs.getString(1) },
            email,
        ).firstOrNull()
        val badges = jdbc.query(
            """select badge.label, badge.image_path from gamification.user_badges user_badge
               join gamification.badges badge on badge.id = user_badge.badge_id
               where user_badge.user_email = ? order by badge.label""",
            RowMapper { rs, _ -> RecognitionBadge(rs.getString(1), rs.getString(2)) },
            email,
        )
        return Recognition(title, badges)
    }
}

data class LevelRecord(val level: Int, val minimumXp: Long, val label: String)
