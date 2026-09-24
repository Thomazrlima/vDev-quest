package br.com.vdevquest.gamification

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.auth.RequestDatabaseContext
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.profile.UserRepository
import br.com.vdevquest.profile.levelProgress
import br.com.vdevquest.profile.RecognitionBadge
import br.com.vdevquest.profile.UserRole
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
    val progress: Int,
    val xpToNextLevel: Long?,
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
    private val databaseContext: RequestDatabaseContext,
    private val users: UserRepository,
    private val rankings: RankingRepository,
) {
    @GetMapping("/ranking")
    @Transactional
    fun ranking(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(required = false) cursor: String?,
        @RequestParam(defaultValue = "20") limit: Int,
    ): CursorPage<RankingEntry> {
        val actor = contexts.establish(currentUser.from(jwt))
        val offset = cursor?.let(::decodeOffset) ?: 0
        val size = limit.coerceIn(1, 50)
        val levels = users.levels()
        // This public projection needs to read across users. The elevated RLS context
        // is local to this transaction and ends with it.
        databaseContext.apply(actor.email, UserRole.manager.name)
        val profiles = rankings.profiles(offset, size + 1)
        val page = profiles.take(size)
        val emails = page.map { it.email }
        val titles = if (emails.isEmpty()) emptyMap() else rankings.activeTitles(emails)
        val badges = if (emails.isEmpty()) emptyMap() else rankings.badges(emails)
        val avatars = if (emails.isEmpty()) emptyMap() else rankings.avatars(emails)
        val entries = page.mapIndexed { index, profile ->
            val xp = profile.xp
            val currentLevelIndex = levels.indexOfLast { it.minimumXp <= xp }
            val currentLevel = levels[currentLevelIndex]
            val nextLevel = levels.getOrNull(currentLevelIndex + 1)
            val progress = levelProgress(xp, currentLevel, nextLevel)
            RankingEntry(
                offset + index + 1,
                profile.name,
                xp,
                profile.activeSubmissions,
                currentLevel.level,
                currentLevel.label,
                progress.percent ?: 100,
                progress.xpToNextLevel,
                titles[profile.email],
                badges[profile.email].orEmpty(),
                avatars.getValue(profile.email),
            )
        }
        return CursorPage(entries, if (profiles.size > size) encodeOffset(offset + size) else null)
    }

    private fun encodeOffset(value: Int): String = Base64.getUrlEncoder().withoutPadding().encodeToString(value.toString().toByteArray(StandardCharsets.UTF_8))
    private fun decodeOffset(cursor: String): Int = runCatching { String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8).toInt() }
        .getOrNull()?.takeIf { it >= 0 } ?: 0
}
