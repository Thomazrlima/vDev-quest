package br.com.vdevquest.gamification

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.profile.RecognitionBadge
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.nio.charset.StandardCharsets
import java.util.Base64

data class RankingEntry(
    val position: Int,
    val name: String,
    val xp: Long,
    val completedMissions: Long,
    val level: Int,
    val levelLabel: String,
    val activeTitle: String?,
    val badges: List<RecognitionBadge>,
    val avatar: RankingAvatar,
)
data class RankingAvatar(val bodyType: String, val skinColorIndex: Int, val slots: List<RankingAvatarSlot>)
data class RankingAvatarSlot(val slot: String, val code: String?, val colorIndex: Int)
data class CursorPage<T>(val items: List<T>, val nextCursor: String?)

@RestController
@RequestMapping("/api/v1")
class RankingController(
    private val currentUser: CurrentUser,
    private val contexts: UserContextService,
    private val jdbc: JdbcTemplate,
    private val objectMapper: ObjectMapper,
) {
    @GetMapping("/ranking")
    @Transactional
    fun ranking(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(required = false) cursor: String?,
        @RequestParam(defaultValue = "20") limit: Int,
    ): CursorPage<RankingEntry> {
        contexts.establish(currentUser.from(jwt))
        val offset = cursor?.let(::decodeOffset) ?: 0
        val size = limit.coerceIn(1, 50)
        val entries = jdbc.query(
            "select name, xp, active_submissions, level, level_label, active_title, badges::text as badges, avatar::text as avatar from private.ranking_profiles() offset ? limit ?",
            { rs, index -> RankingEntry(
                offset + index + 1,
                rs.getString("name"),
                rs.getLong("xp"),
                rs.getLong("active_submissions"),
                rs.getInt("level"),
                rs.getString("level_label"),
                rs.getString("active_title"),
                objectMapper.readValue(rs.getString("badges"), objectMapper.typeFactory.constructCollectionType(List::class.java, RecognitionBadge::class.java)),
                objectMapper.readValue(rs.getString("avatar"), RankingAvatar::class.java),
            ) },
            offset,
            size + 1,
        )
        val hasNext = entries.size > size
        return CursorPage(entries.take(size), if (hasNext) encodeOffset(offset + size) else null)
    }

    private fun encodeOffset(value: Int): String = Base64.getUrlEncoder().withoutPadding().encodeToString(value.toString().toByteArray(StandardCharsets.UTF_8))
    private fun decodeOffset(cursor: String): Int = runCatching { String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8).toInt() }
        .getOrNull()?.takeIf { it >= 0 } ?: 0
}
