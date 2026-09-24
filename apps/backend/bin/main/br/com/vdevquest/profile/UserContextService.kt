package br.com.vdevquest.profile

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.auth.RequestDatabaseContext
import br.com.vdevquest.shared.ForbiddenException
import org.springframework.stereotype.Service

data class Actor(val email: String, val name: String, val role: UserRole, val xp: Long) {
    fun requireManager() {
        if (role != UserRole.manager) throw ForbiddenException("Esta ação é exclusiva para administradores.")
    }
}

@Service
class UserContextService(
    private val requestDatabaseContext: RequestDatabaseContext,
    private val users: UserRepository,
) {
    fun establish(authenticated: AuthenticatedUser): Actor {
        requestDatabaseContext.apply(authenticated.email, UserRole.collaborator.name)
        if (users.find(authenticated.email) == null) users.provision(authenticated.email, authenticated.displayName)
        val user = users.find(authenticated.email) ?: error("Provisionamento de usuário falhou.")
        requestDatabaseContext.apply(user.email, user.role.name)
        return Actor(user.email, user.name, user.role, user.xp)
    }
}
