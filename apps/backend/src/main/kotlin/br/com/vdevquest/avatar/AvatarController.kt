package br.com.vdevquest.avatar

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.shared.ValidationException
import jakarta.validation.Valid
import jakarta.validation.constraints.Max
import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

data class AvatarItemResponse(
    val id: UUID,
    val slot: String,
    val code: String,
    val label: String,
    val filePath: String,
    val shapedFilePath: String?,
    val underFilePath: String?,
    val hidesHair: Boolean,
    val hiddenByHats: Boolean,
)

data class AvatarSlotResponse(val slot: String, val item: AvatarItemResponse?, val colorIndex: Int)
data class AvatarResponse(val bodyType: String, val skinColorIndex: Int, val slots: List<AvatarSlotResponse>)
data class AvatarSlotUpdate(@field:NotBlank val slot: String, val itemId: UUID?, @field:Min(0) @field:Max(15) val colorIndex: Int)
data class AvatarUpdateRequest(
    @field:NotBlank val bodyType: String,
    @field:Min(0) @field:Max(15) val skinColorIndex: Int,
    val slots: List<@Valid AvatarSlotUpdate>,
)

@RestController
@RequestMapping("/api/v1")
class AvatarController(
    private val currentUser: CurrentUser,
    private val avatars: AvatarService,
) {
    @GetMapping("/me/avatar")
    fun mine(@AuthenticationPrincipal jwt: Jwt): AvatarResponse = avatars.get(currentUser.from(jwt))

    @PatchMapping("/me/avatar")
    fun update(@AuthenticationPrincipal jwt: Jwt, @Valid @RequestBody request: AvatarUpdateRequest): AvatarResponse =
        avatars.update(currentUser.from(jwt), request)

    @GetMapping("/avatar/catalog")
    fun catalog(@AuthenticationPrincipal jwt: Jwt): List<AvatarItemResponse> = avatars.catalog(currentUser.from(jwt))
}

@org.springframework.stereotype.Service
class AvatarService(
    private val contexts: UserContextService,
    private val jdbc: JdbcTemplate,
) {
    @Transactional
    fun get(user: AuthenticatedUser): AvatarResponse {
        val actor = contexts.establish(user)
        ensureAvatar(actor.email)
        return read(actor.email)
    }

    @Transactional
    fun update(user: AuthenticatedUser, request: AvatarUpdateRequest): AvatarResponse {
        val actor = contexts.establish(user)
        if (request.bodyType !in setOf("hero", "heroine")) throw ValidationException("Tipo de corpo inválido.")
        if (request.slots.map { it.slot }.distinct().size != request.slots.size) throw ValidationException("Cada camada do avatar pode ser enviada uma única vez.")
        ensureAvatar(actor.email)
        jdbc.update("update avatar.user_avatars set body_type = ?::avatar.body_type, skin_color_index = ? where user_email = ?", request.bodyType, request.skinColorIndex, actor.email)
        request.slots.forEach { change ->
            val validSlot = jdbc.queryForObject("select exists(select 1 from avatar.slot_definitions where slot::text = ?)", Boolean::class.java, change.slot) == true
            if (!validSlot) throw ValidationException("Camada de avatar inválida.")
            if (change.itemId != null) {
                val validItem = jdbc.queryForObject("select exists(select 1 from avatar.items where id = ? and slot::text = ?)", Boolean::class.java, change.itemId, change.slot) == true
                if (!validItem) throw ValidationException("O item não pertence à camada informada.")
            }
            jdbc.update(
                """insert into avatar.user_slot_settings(user_email, slot, item_id, color_index) values (?, ?::avatar.avatar_slot, ?, ?)
                   on conflict (user_email, slot) do update set item_id = excluded.item_id, color_index = excluded.color_index""",
                actor.email, change.slot, change.itemId, change.colorIndex,
            )
        }
        return read(actor.email)
    }

    @Transactional
    fun catalog(user: AuthenticatedUser): List<AvatarItemResponse> {
        contexts.establish(user)
        return jdbc.query(
            "select id, slot::text as slot, code, label, file_path, shaped_file_path, under_file_path, hides_hair, hidden_by_hats from avatar.items order by slot, label",
        ) { rs, _ -> item(rs) }
    }

    private fun ensureAvatar(email: String) {
        jdbc.update("insert into avatar.user_avatars(user_email) values (?) on conflict do nothing", email)
    }

    private fun read(email: String): AvatarResponse {
        val base = jdbc.query("select body_type::text, skin_color_index from avatar.user_avatars where user_email = ?", { rs, _ -> rs.getString(1) to rs.getInt(2) }, email).single()
        val slots = jdbc.query(
            """select d.slot::text as slot, s.color_index, i.id, i.code, i.label, i.file_path, i.shaped_file_path, i.under_file_path, i.hides_hair, i.hidden_by_hats
               from avatar.slot_definitions d left join avatar.user_slot_settings s on s.slot = d.slot and s.user_email = ?
               left join avatar.items i on i.id = s.item_id order by d.draw_order""",
            { rs, _ -> AvatarSlotResponse(rs.getString("slot"), rs.getObject("id", UUID::class.java)?.let { item(rs) }, rs.getInt("color_index")) },
            email,
        )
        return AvatarResponse(base.first, base.second, slots)
    }

    private fun item(rs: java.sql.ResultSet) = AvatarItemResponse(
        rs.getObject("id", UUID::class.java), rs.getString("slot"), rs.getString("code"), rs.getString("label"),
        rs.getString("file_path"), rs.getString("shaped_file_path"), rs.getString("under_file_path"),
        rs.getBoolean("hides_hair"), rs.getBoolean("hidden_by_hats"),
    )
}
