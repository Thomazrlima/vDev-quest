package br.com.vdevquest.auth

import br.com.vdevquest.shared.ValidationException
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.stereotype.Component

data class AuthenticatedUser(val email: String, val displayName: String)

@Component
class CurrentUser {
    fun from(jwt: Jwt): AuthenticatedUser {
        val verified = jwt.getClaimAsBoolean("email_verified") ?: false
        val email = jwt.getClaimAsString("email")?.trim()?.lowercase()
        if (!verified || email.isNullOrBlank() || !email.contains('@')) {
            throw ValidationException("O provedor de identidade precisa informar um e-mail corporativo verificado.")
        }
        val name = jwt.getClaimAsString("name")?.trim()?.takeIf { it.isNotBlank() }
            ?: jwt.getClaimAsString("preferred_username")?.trim()?.takeIf { it.isNotBlank() }
            ?: email.substringBefore('@')
        return AuthenticatedUser(email, name)
    }
}

fun authenticatedUser(currentUser: CurrentUser, jwt: Jwt): AuthenticatedUser = currentUser.from(jwt)
