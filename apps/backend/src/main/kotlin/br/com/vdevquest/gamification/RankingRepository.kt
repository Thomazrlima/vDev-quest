package br.com.vdevquest.gamification

import br.com.vdevquest.profile.RecognitionBadge
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate
import org.springframework.stereotype.Repository

data class RankingProfile(
    val email: String,
    val name: String,
    val xp: Long,
    val activeSubmissions: Long,
)

@Repository
class RankingRepository(
    private val jdbc: JdbcTemplate,
    private val namedJdbc: NamedParameterJdbcTemplate,
) {
    fun profiles(offset: Int, limit: Int): List<RankingProfile> = jdbc.query(
        """
        select u.email, u.name, u.xp, count(s.id) filter (where s.status = 'active') as active_submissions
        from core.users u
        left join quests.submissions s on s.collaborator_email = u.email
        group by u.email, u.name, u.xp
        order by u.xp desc, active_submissions desc, u.name asc
        offset ? limit ?
        """.trimIndent(),
        { rs, _ -> RankingProfile(rs.getString("email"), rs.getString("name"), rs.getLong("xp"), rs.getLong("active_submissions")) },
        offset,
        limit,
    )

    fun activeTitles(emails: List<String>): Map<String, String> = namedJdbc.query(
        """
        select user_title.user_email, title.label
        from gamification.user_titles user_title
        join gamification.titles title on title.id = user_title.title_id
        where user_title.user_email in (:emails) and user_title.is_active
        """.trimIndent(),
        mapOf("emails" to emails),
    ) { rs, _ -> rs.getString("user_email") to rs.getString("label") }.toMap()

    fun badges(emails: List<String>): Map<String, List<RecognitionBadge>> = namedJdbc.query(
        """
        select user_badge.user_email, badge.label, badge.image_path
        from gamification.user_badges user_badge
        join gamification.badges badge on badge.id = user_badge.badge_id
        where user_badge.user_email in (:emails)
        order by badge.label
        """.trimIndent(),
        mapOf("emails" to emails),
    ) { rs, _ -> rs.getString("user_email") to RecognitionBadge(rs.getString("label"), rs.getString("image_path")) }
        .groupBy({ it.first }, { it.second })

    fun avatars(emails: List<String>): Map<String, RankingAvatar> {
        val avatars = namedJdbc.query(
            "select user_email, body_type::text as body_type, skin_color_index from avatar.user_avatars where user_email in (:emails)",
            mapOf("emails" to emails),
        ) { rs, _ -> rs.getString("user_email") to RankingAvatar(rs.getString("body_type"), rs.getInt("skin_color_index"), emptyList()) }.toMap()

        val slots = namedJdbc.query(
            """
            select setting.user_email, setting.slot::text as slot, item.code, setting.color_index
            from avatar.user_slot_settings setting
            join avatar.slot_definitions definition on definition.slot = setting.slot
            left join avatar.items item on item.id = setting.item_id
            where setting.user_email in (:emails)
            order by definition.draw_order
            """.trimIndent(),
            mapOf("emails" to emails),
        ) { rs, _ -> rs.getString("user_email") to RankingAvatarSlot(rs.getString("slot"), rs.getString("code"), rs.getInt("color_index")) }
            .groupBy({ it.first }, { it.second })

        return emails.associateWith { email ->
            avatars[email]?.copy(slots = slots[email].orEmpty()) ?: RankingAvatar("hero", 0, emptyList())
        }
    }
}
