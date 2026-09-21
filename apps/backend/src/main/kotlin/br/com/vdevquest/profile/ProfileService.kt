package br.com.vdevquest.profile

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.shared.ValidationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class ProfileResponse(
    val name: String,
    val xp: Long,
    val role: UserRole,
    val level: Int,
    val levelLabel: String,
    val progress: Int?,
    val nextLevelXp: Long?,
    val activeTitle: String?,
    val badges: List<RecognitionBadge>,
)

@Service
class ProfileService(
    private val contexts: UserContextService,
    private val users: UserRepository,
) {
    @Transactional
    fun session(user: AuthenticatedUser): ProfileResponse = profileFor(contexts.establish(user))

    @Transactional
    fun updateName(user: AuthenticatedUser, requestedName: String): ProfileResponse {
        val actor = contexts.establish(user)
        val name = requestedName.trim()
        if (name.isEmpty()) throw ValidationException("Informe um nome de exibição.")
        users.updateName(actor.email, name)
        return profileFor(contexts.establish(user))
    }

    private fun profileFor(actor: Actor): ProfileResponse {
        val level = users.levelFor(actor.xp)
        val next = users.nextLevelFor(actor.xp)
        val progress = next?.let {
            val interval = it.minimumXp - level.minimumXp
            if (interval <= 0) 100 else (((actor.xp - level.minimumXp) * 100) / interval).toInt().coerceIn(0, 100)
        }
        val recognition = users.recognitionFor(actor.email)
        return ProfileResponse(actor.name, actor.xp, actor.role, level.level, level.label, progress, next?.minimumXp, recognition.activeTitle, recognition.badges)
    }
}
