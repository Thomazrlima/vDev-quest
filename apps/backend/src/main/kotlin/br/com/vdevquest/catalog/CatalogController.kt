package br.com.vdevquest.catalog

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.quests.IdempotencyService
import br.com.vdevquest.shared.ConflictException
import br.com.vdevquest.shared.UuidV7
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size
import org.springframework.dao.DuplicateKeyException
import org.springframework.http.HttpStatus
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import java.text.Normalizer
import java.util.UUID

data class CatalogEntry(val id: UUID, val code: String, val label: String, val description: String?, val imagePath: String?)
data class CreateTitleRequest(@field:NotBlank @field:Size(max = 100) val label: String, @field:Size(max = 500) val description: String?)
data class CreateBadgeRequest(@field:NotBlank @field:Size(max = 100) val label: String, @field:Size(max = 500) val description: String?, @field:NotBlank @field:Size(max = 255) val imagePath: String)

@RestController
@RequestMapping("/api/v1/catalog")
class CatalogController(
    private val currentUser: CurrentUser,
    private val contexts: UserContextService,
    private val jdbc: JdbcTemplate,
    private val ids: UuidV7,
    private val idempotency: IdempotencyService,
) {
    @GetMapping("/titles")
    @Transactional
    fun titles(@AuthenticationPrincipal jwt: Jwt): List<CatalogEntry> {
        contexts.establish(currentUser.from(jwt))
        return jdbc.query("select id, code, label, description from gamification.titles order by label", { rs, _ -> CatalogEntry(rs.getObject("id", UUID::class.java), rs.getString("code"), rs.getString("label"), rs.getString("description"), null) })
    }

    @GetMapping("/badges")
    @Transactional
    fun badges(@AuthenticationPrincipal jwt: Jwt): List<CatalogEntry> {
        contexts.establish(currentUser.from(jwt))
        return jdbc.query("select id, code, label, description, image_path from gamification.badges order by label", { rs, _ -> CatalogEntry(rs.getObject("id", UUID::class.java), rs.getString("code"), rs.getString("label"), rs.getString("description"), rs.getString("image_path")) })
    }

    @PostMapping("/titles")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    fun createTitle(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateTitleRequest,
        @RequestHeader("Idempotency-Key") idempotencyHeader: String,
    ): CatalogEntry {
        val actor = contexts.establish(currentUser.from(jwt)); actor.requireManager()
        val key = idempotencyHeader.idempotencyKey()
        idempotency.existing(actor.email, key, "title|${request.label}|${request.description}", CatalogEntry::class.java)?.let { return it }
        val code = nextCode("titles", request.label)
        val result = CatalogEntry(ids.next(), code, request.label.trim(), request.description?.trim()?.ifBlank { null }, null)
        try { jdbc.update("insert into gamification.titles(id, code, label, description) values (?, ?, ?, ?)", result.id, result.code, result.label, result.description) }
        catch (_: DuplicateKeyException) { throw ConflictException("Já existe um title com este código.") }
        return result.also { idempotency.finish(actor.email, key, it) }
    }

    @PostMapping("/badges")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    fun createBadge(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: CreateBadgeRequest,
        @RequestHeader("Idempotency-Key") idempotencyHeader: String,
    ): CatalogEntry {
        val actor = contexts.establish(currentUser.from(jwt)); actor.requireManager()
        val key = idempotencyHeader.idempotencyKey()
        idempotency.existing(actor.email, key, "badge|${request.label}|${request.description}|${request.imagePath}", CatalogEntry::class.java)?.let { return it }
        val code = nextCode("badges", request.label)
        val result = CatalogEntry(ids.next(), code, request.label.trim(), request.description?.trim()?.ifBlank { null }, request.imagePath.trim())
        try { jdbc.update("insert into gamification.badges(id, code, label, description, image_path) values (?, ?, ?, ?, ?)", result.id, result.code, result.label, result.description, result.imagePath) }
        catch (_: DuplicateKeyException) { throw ConflictException("Já existe um badge com este código.") }
        return result.also { idempotency.finish(actor.email, key, it) }
    }

    private fun nextCode(table: String, label: String): String {
        val base = Normalizer.normalize(label, Normalizer.Form.NFD)
            .replace(Regex("\\p{M}+"), "")
            .lowercase()
            .replace(Regex("[^a-z0-9]+"), "-")
            .trim('-')
            .take(70)
            .trimEnd('-')
            .ifBlank { "catalogo" }
        var suffix = 1
        while (true) {
            val candidate = if (suffix == 1) base else "${base.take(75 - suffix.toString().length).trimEnd('-')}-${suffix}"
            val exists = jdbc.queryForObject("select exists(select 1 from gamification.$table where code = ?)", Boolean::class.java, candidate) == true
            if (!exists) return candidate
            suffix++
        }
    }
}

private fun String.idempotencyKey(): UUID = runCatching { UUID.fromString(this) }.getOrElse {
    throw br.com.vdevquest.shared.ValidationException("Idempotency-Key deve ser um UUID válido.")
}
