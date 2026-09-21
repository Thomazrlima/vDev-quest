package br.com.vdevquest.quests

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.shared.ValidationException
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.HttpStatus
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.ResponseStatus
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate
import java.util.UUID

data class InvalidateSubmissionRequest(@field:NotBlank val justification: String)

@RestController
@RequestMapping("/api/v1")
class QuestController(
    private val currentUser: CurrentUser,
    private val missions: MissionService,
    private val submissions: SubmissionService,
    private val storage: EvidenceStorage,
) {
    @GetMapping("/missions")
    fun listMissions(@AuthenticationPrincipal jwt: Jwt): List<MissionResponse> = missions.list(currentUser.from(jwt))

    @PostMapping("/missions")
    @ResponseStatus(HttpStatus.CREATED)
    fun createMission(
        @AuthenticationPrincipal jwt: Jwt,
        @Valid @RequestBody request: MissionRequest,
        @RequestHeader("Idempotency-Key") idempotencyHeader: String,
    ): MissionResponse = missions.create(currentUser.from(jwt), request, idempotencyHeader.toUuid())

    @GetMapping("/missions/{id}")
    fun getMission(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID): MissionResponse = missions.get(currentUser.from(jwt), id)

    @PatchMapping("/missions/{id}")
    fun updateMission(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID, @Valid @RequestBody request: MissionRequest): MissionResponse = missions.update(currentUser.from(jwt), id, request)

    @PostMapping("/missions/{id}/invalidate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun invalidateMission(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID) {
        submissions.invalidateMission(currentUser.from(jwt), id)
    }

    @GetMapping("/mural")
    fun mural(@AuthenticationPrincipal jwt: Jwt): List<MuralMissionResponse> = missions.mural(currentUser.from(jwt))

    @PostMapping("/missions/{id}/submissions", consumes = ["multipart/form-data"])
    @ResponseStatus(HttpStatus.CREATED)
    fun submit(
        @AuthenticationPrincipal jwt: Jwt,
        @PathVariable id: UUID,
        @RequestHeader("Idempotency-Key") idempotencyHeader: String,
        @RequestParam(required = false) submissionId: UUID?,
        @RequestParam(required = false) occurrenceDate: LocalDate?,
        @RequestParam(required = false) value: String?,
        @RequestPart(required = false) file: MultipartFile?,
    ): SubmitResult {
        val user = currentUser.from(jwt)
        val type = missions.evidenceType(user, id)
        val stored = file?.let { storage.upload(type, it) }
        return try {
            submissions.submit(user, id, submissionId, occurrenceDate, EvidencePayload(value?.trim()?.takeIf { it.isNotEmpty() }, stored), idempotencyHeader.toUuid())
        } catch (error: RuntimeException) {
            stored?.let { storage.deleteQuietly(it.objectKey) }
            throw error
        }
    }

    @PostMapping("/submissions/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun cancel(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID) {
        submissions.cancel(currentUser.from(jwt), id)
    }

    @GetMapping("/submissions/{id}/evidence/{phase}/download")
    @org.springframework.transaction.annotation.Transactional
    fun evidenceDownload(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID, @PathVariable phase: Int): Map<String, String> {
        val key = submissions.evidenceObjectKeyForDownload(currentUser.from(jwt), id, phase)
            ?: throw br.com.vdevquest.shared.NotFoundException("Esta fase não possui arquivo para download.")
        return mapOf("url" to storage.temporaryDownloadUrl(key))
    }

    @PostMapping("/admin/submissions/{id}/invalidate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun invalidateSubmission(@AuthenticationPrincipal jwt: Jwt, @PathVariable id: UUID, @Valid @RequestBody request: InvalidateSubmissionRequest) {
        submissions.invalidate(currentUser.from(jwt), id, request.justification)
    }
}

private fun String.toUuid(): UUID = runCatching { UUID.fromString(this) }.getOrElse {
    throw ValidationException("Idempotency-Key deve ser um UUID válido.")
}
