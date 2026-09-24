package br.com.vdevquest.quests

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.gamification.XpLedgerService
import br.com.vdevquest.gamification.XpMovementType
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.shared.ConflictException
import br.com.vdevquest.shared.ForbiddenException
import br.com.vdevquest.shared.NotFoundException
import br.com.vdevquest.shared.UuidV7
import br.com.vdevquest.shared.ValidationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URI
import java.time.Clock
import java.time.LocalDate
import java.util.UUID

data class SubmissionOutcome(val result: SubmitResult, val consumedFile: Boolean)

@Service
class SubmissionService(
    private val contexts: UserContextService,
    private val missions: MissionRepository,
    private val missionService: MissionService,
    private val submissions: SubmissionRepository,
    private val ledger: XpLedgerService,
    private val checkins: CheckinService,
    private val idempotency: IdempotencyService,
    private val ids: UuidV7,
    private val clock: Clock,
) {
    @Transactional
    fun evidenceObjectKeyForDownload(user: AuthenticatedUser, submissionId: UUID, phase: Int): String? {
        contexts.establish(user)
        submissions.find(submissionId) ?: throw NotFoundException("Submissão não encontrada.")
        return submissions.evidenceObjectKey(submissionId, phase)
    }

    @Transactional
    fun submit(
        user: AuthenticatedUser,
        missionId: UUID,
        submissionId: UUID?,
        startNew: Boolean,
        occurrenceDate: LocalDate?,
        payload: EvidencePayload,
        idempotencyKey: UUID,
    ): SubmissionOutcome {
        val actor = contexts.establish(user)
        val fingerprint = listOf(missionId, submissionId, startNew, occurrenceDate, payload.value, payload.file?.sha256, payload.file?.originalFileName, payload.file?.mimeType).joinToString("|")
        idempotency.existing(actor.email, idempotencyKey, fingerprint, SubmitResult::class.java)?.let { return SubmissionOutcome(it, false) }

        val mission = missions.find(missionId, lock = true) ?: throw NotFoundException("Missão não encontrada.")
        validateAvailability(mission, occurrenceDate)
        validateEvidence(mission.evidenceType, payload)
        val phases = missions.phases(missionId)
        val active = submissions.activeForMission(missionId, actor.email)
        val requiredOccurrence = missionService.occurrenceDate(mission, LocalDate.now(clock), occurrenceDate)
        val record = chooseSubmission(mission, phases, active, submissionId, startNew, requiredOccurrence, actor.email)
        val nextPhase = if (record.currentPhase == 0) 1 else record.currentPhase + 1
        val phase = phases.firstOrNull { it.number == nextPhase }
            ?: throw ConflictException("Esta submissão já concluiu todas as fases da missão.")

        submissions.addEvidence(record.id, phase.number, payload)
        submissions.advance(record.id, phase.number)
        val movement = ledger.grant(
            actor.email,
            record.id,
            phase.number,
            phase.xpReward,
            if (mission.isCheckin) XpMovementType.checkin_base_reward else XpMovementType.phase_reward,
        )
        if (mission.isCheckin) checkins.recalculate(mission.id, actor.email)
        val result = SubmitResult(
            record.id,
            phase.number,
            phase.number == phases.last().number,
            movement.amount,
            submissions.userXp(actor.email),
        )
        idempotency.finish(actor.email, idempotencyKey, result)
        return SubmissionOutcome(result, true)
    }

    @Transactional
    fun cancel(user: AuthenticatedUser, submissionId: UUID) {
        val actor = contexts.establish(user)
        val submission = submissions.find(submissionId, lock = true) ?: throw NotFoundException("Submissão não encontrada.")
        if (submission.collaboratorEmail != actor.email) throw ForbiddenException("Você só pode cancelar as próprias submissões.")
        if (submission.status != SubmissionStatus.active) return
        submissions.transition(submission.id, SubmissionStatus.cancelled, actor.email, "user_cancellation")
        ledger.reverseOutstanding(submission.id, XpMovementType.user_cancellation_reversal)
        missions.find(submission.missionId)?.takeIf { it.isCheckin }?.let { checkins.recalculate(it.id, actor.email) }
    }

    @Transactional
    fun invalidate(user: AuthenticatedUser, submissionId: UUID, justification: String) {
        val actor = contexts.establish(user)
        actor.requireManager()
        val reason = justification.trim()
        if (reason.isEmpty()) throw ValidationException("Informe a justificativa da invalidação.")
        val submission = submissions.find(submissionId, lock = true) ?: throw NotFoundException("Submissão não encontrada.")
        if (submission.status != SubmissionStatus.active) return
        submissions.transition(submission.id, SubmissionStatus.invalidated, actor.email, "admin_invalidation", reason)
        ledger.reverseOutstanding(submission.id, XpMovementType.admin_invalidation_reversal)
        missions.find(submission.missionId)?.takeIf { it.isCheckin }?.let { checkins.recalculate(it.id, submission.collaboratorEmail) }
    }

    @Transactional
    fun invalidateMission(user: AuthenticatedUser, missionId: UUID) {
        val actor = contexts.establish(user)
        actor.requireManager()
        val mission = missions.find(missionId, lock = true) ?: throw NotFoundException("Missão não encontrada.")
        if (mission.status == MissionStatus.invalidated) return
        missions.invalidate(missionId, actor.email)
        submissions.activeForMission(missionId).forEach { submission ->
            submissions.transition(submission.id, SubmissionStatus.invalidated, actor.email, "mission_invalidation")
            ledger.reverseOutstanding(submission.id, XpMovementType.mission_invalidation_reversal)
            if (mission.isCheckin) checkins.recalculate(mission.id, submission.collaboratorEmail)
        }
    }

    private fun chooseSubmission(
        mission: MissionRecord,
        phases: List<MissionPhaseResponse>,
        active: List<SubmissionRecord>,
        selectedId: UUID?,
        startNew: Boolean,
        occurrenceDate: LocalDate?,
        actorEmail: String,
    ): SubmissionRecord {
        if (mission.recurrenceType != RecurrenceType.none) {
            if (active.any { it.occurrenceDate == occurrenceDate }) throw ConflictException("Já existe uma submissão válida para esta ocorrência.")
            return createSubmission(mission.id, actorEmail, occurrenceDate)
        }
        if (selectedId != null) {
            if (startNew) throw ValidationException("Escolha uma submissão existente ou inicie uma nova, não os dois.")
            return active.firstOrNull { it.id == selectedId } ?: throw NotFoundException("Submissão ativa não encontrada nesta missão.")
        }
        if (startNew) {
            if (!mission.allowsMultipleSubmissions) throw ConflictException("Esta missão não permite várias submissões independentes.")
            return createSubmission(mission.id, actorEmail, null)
        }
        val incomplete = active.firstOrNull { it.currentPhase < phases.last().number }
        if (incomplete != null) return incomplete
        if (active.isNotEmpty() && !mission.allowsMultipleSubmissions) throw ConflictException("Esta missão já possui uma submissão válida.")
        return createSubmission(mission.id, actorEmail, null)
    }

    private fun createSubmission(missionId: UUID, actorEmail: String, occurrenceDate: LocalDate?): SubmissionRecord {
        val id = ids.next()
        submissions.insert(id, missionId, actorEmail, occurrenceDate)
        return SubmissionRecord(id, missionId, actorEmail, 0, occurrenceDate, SubmissionStatus.active)
    }

    private fun validateAvailability(mission: MissionRecord, requestedOccurrence: LocalDate?) {
        val today = LocalDate.now(clock)
        if (mission.status != MissionStatus.active || today !in mission.startDate..mission.endDate) throw ConflictException("A missão não está disponível hoje.")
        if (!missionService.matchesOccurrence(mission, today)) throw ConflictException("Esta missão não possui ocorrência hoje.")
        if (mission.isCheckin) {
            val date = requestedOccurrence ?: throw ValidationException("Escolha a data de competência do check-in.")
            if (mission.startDate.month != today.month || mission.startDate.year != today.year || date !in mission.startDate..today) {
                throw ValidationException("O check-in só aceita datas do mês corrente entre o primeiro dia e hoje.")
            }
        } else if (requestedOccurrence != null) {
            throw ValidationException("Data de competência só é aceita em check-ins.")
        }
    }

    private fun validateEvidence(type: EvidenceType, payload: EvidencePayload) {
        when (type) {
            EvidenceType.text -> if (payload.file != null || payload.value.isNullOrBlank()) throw ValidationException("Informe uma evidência em texto.")
            EvidenceType.link -> {
                if (payload.file != null || payload.value.isNullOrBlank()) throw ValidationException("Informe um link HTTP(S).")
                val uri = runCatching { URI(payload.value.trim()) }.getOrNull()
                if (uri?.scheme !in setOf("http", "https") || uri?.host.isNullOrBlank()) throw ValidationException("Informe um link HTTP(S) válido.")
            }
            EvidenceType.photo, EvidenceType.pdf -> if (payload.file == null || payload.value != null) throw ValidationException("Anexe o arquivo de evidência solicitado.")
        }
    }
}
