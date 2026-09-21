package br.com.vdevquest.profile

import br.com.vdevquest.auth.CurrentUser
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.http.MediaType
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class UpdateNameRequest(@field:NotBlank @field:Size(max = 80) val name: String)

@RestController
@RequestMapping("/api/v1")
class ProfileController(
    private val currentUser: CurrentUser,
    private val profiles: ProfileService,
) {
    @GetMapping("/session", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun session(@AuthenticationPrincipal jwt: Jwt): ProfileResponse = profiles.session(currentUser.from(jwt))

    @GetMapping("/me", produces = [MediaType.APPLICATION_JSON_VALUE])
    fun me(@AuthenticationPrincipal jwt: Jwt): ProfileResponse = profiles.session(currentUser.from(jwt))

    @PatchMapping("/me", consumes = [MediaType.APPLICATION_JSON_VALUE])
    fun updateName(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody request: UpdateNameRequest): ProfileResponse =
        profiles.updateName(currentUser.from(jwt), request.name)
}
