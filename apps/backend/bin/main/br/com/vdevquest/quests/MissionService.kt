package br.com.vdevquest.quests

import br.com.vdevquest.auth.AuthenticatedUser
import br.com.vdevquest.profile.UserContextService
import br.com.vdevquest.shared.ConflictException
import br.com.vdevquest.shared.NotFoundException
import br.com.vdevquest.shared.UuidV7
import br.com.vdevquest.shared.ValidationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Clock
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

@Service
class MissionService(
    private val contexts: UserContextService,
    private val missions: MissionRepository,
    private val submissions: SubmissionRepository,
    private val idempotency: IdempotencyService,
    private val ids: UuidV7,
    private val clock: Clock,
) {
    @Transactional
    fun create(user: AuthenticatedUser, request: MissionRequest, idempotencyKey: UUID): MissionResponse {
        val actor = contexts.establish(user)
        actor.requireManager()
        val fingerprint = listOf(request.title, request.description, request.evidenceType, request.startDate, request.endDate, request.recurrenceType, request.weekdays, request.isCheckin, request.allowsMultipleSubmissions, request.phases).joinToString("|")
        idempotency.existing(actor.email, idempotencyKey, fingerprint, MissionResponse::class.java)?.let { return it }
        validate(request)
        val id = ids.next()
        val mission = MissionRecord(
            id, uniqueSlug(request.title), actor.email, request.title.trim(), request.description.trim(), request.evidenceType,
            request.startDate, request.endDate, request.recurrenceType, request.isCheckin, request.allowsMultipleSubmissions, MissionStatus.active,
        )
        missions.insert(mission, request.phases, request.weekdays)
        return response(mission).also { idempotency.finish(actor.email, idempotencyKey, it) }
    }

    @Transactional
    fun list(user: AuthenticatedUser): List<MissionResponse> {
        contexts.establish(user).requireManager()
        return missions.list().map(::response)
    }

    @Transactional
    fun get(user: AuthenticatedUser, id: UUID): MissionResponse {
        contexts.establish(user)
        return response(missions.find(id) ?: throw NotFoundException("Missão não encontrada."))
    }

    @Transactional
    fun update(user: AuthenticatedUser, id: UUID, request: MissionRequest): MissionResponse {
        contexts.establish(user).requireManager()
        validate(request)
        val current = missions.find(id, lock = true) ?: throw NotFoundException("Missão não encontrada.")
        if (missions.hasSubmissions(id)) {
            val unchangedRules = current.evidenceType == request.evidenceType && current.startDate == request.startDate && current.endDate == request.endDate &&
                current.recurrenceType == request.recurrenceType && current.isCheckin == request.isCheckin && current.allowsMultipleSubmissions == request.allowsMultipleSubmissions &&
                missions.phases(id) == request.phases.map { MissionPhaseResponse(it.number, it.title.trim(), it.xpReward) } && missions.weekdays(id) == request.weekdays
            if (!unchangedRules) throw ConflictException("As regras da missão não podem mudar após a primeira submissão.")
            missions.updateText(id, request.title.trim(), request.description.trim())
        } else {
            missions.updateText(id, request.title.trim(), request.description.trim())
            missions.replaceRules(id, request.phases, request.weekdays)
        }
        return response(missions.find(id) ?: error("Missão atualizada não encontrada."))
    }

    @Transactional
    fun invalidate(user: AuthenticatedUser, id: UUID) {
        val actor = contexts.establish(user)
        actor.requireManager()
        val mission = missions.find(id, lock = true) ?: throw NotFoundException("Missão não encontrada.")
        if (mission.status == MissionStatus.invalidated) return
        missions.invalidate(id, actor.email)
    }

    @Transactional
    fun mural(user: AuthenticatedUser): List<MuralMissionResponse> {
        val actor = contexts.establish(user)
        val today = LocalDate.now(clock)
        return missions.listAvailable(today)
            .filter { mission -> matchesOccurrence(mission, today) }
            .map { mission ->
                val phases = missions.phases(mission.id)
                val active = submissions.activeForMissionRead(mission.id, actor.email)
                val incomplete = active.firstOrNull { it.currentPhase < phases.last().number }
                val completedCurrentOccurrence = mission.recurrenceType != RecurrenceType.none && active.any { it.currentPhase == phases.last().number && it.occurrenceDate == occurrenceDate(mission, today, null) }
                val completedOneOff = mission.recurrenceType == RecurrenceType.none && active.any { it.currentPhase == phases.last().number }
                val status = when {
                    incomplete != null -> "in_progress"
                    completedCurrentOccurrence || (completedOneOff && !mission.allowsMultipleSubmissions) -> "completed"
                    else -> "available"
                }
                MuralMissionResponse(
                    mission.id, mission.title, mission.description, mission.evidenceType, status, incomplete?.id,
                    if (incomplete == null) phases.firstOrNull() else phases.getOrNull(incomplete.currentPhase),
                    occurrenceDate(mission, today, null), mission.isCheckin, mission.allowsMultipleSubmissions,
                    mission.endDate, phases.sumOf { it.xpReward }, phases.size,
                )
            }
    }

    @Transactional
    fun evidenceType(user: AuthenticatedUser, missionId: UUID): EvidenceType {
        contexts.establish(user)
        return missions.find(missionId)?.takeIf { it.status == MissionStatus.active }?.evidenceType
            ?: throw NotFoundException("Missão ativa não encontrada.")
    }

    fun matchesOccurrence(mission: MissionRecord, date: LocalDate): Boolean = when (mission.recurrenceType) {
        RecurrenceType.none, RecurrenceType.daily -> true
        RecurrenceType.monthly -> true
        RecurrenceType.weekly -> missions.isWeeklyOccurrence(mission.id, date.dayOfWeek.toQuestWeekday())
    }

    fun occurrenceDate(mission: MissionRecord, today: LocalDate, requested: LocalDate?): LocalDate? = when {
        mission.isCheckin -> requested
        mission.recurrenceType == RecurrenceType.none -> null
        mission.recurrenceType == RecurrenceType.monthly -> today.withDayOfMonth(1)
        else -> today
    }

    private fun response(mission: MissionRecord): MissionResponse = MissionResponse(
        mission.id, mission.slug, mission.title, mission.description, mission.evidenceType, mission.startDate, mission.endDate,
        mission.recurrenceType, missions.weekdays(mission.id), mission.isCheckin, mission.allowsMultipleSubmissions,
        mission.status, missions.hasSubmissions(mission.id), missions.phases(mission.id),
    )

    private fun validate(request: MissionRequest) {
        if (request.endDate < request.startDate) throw ValidationException("A data final não pode ser anterior à data inicial.")
        val expected = (1..request.phases.size).toList()
        if (request.phases.map { it.number }.sorted() != expected) throw ValidationException("As fases devem começar em 1 e ser sequenciais.")
        if (request.recurrenceType == RecurrenceType.weekly && request.weekdays.isEmpty()) throw ValidationException("Missões semanais precisam de ao menos um dia.")
        if (request.recurrenceType != RecurrenceType.weekly && request.weekdays.isNotEmpty()) throw ValidationException("Dias da semana só se aplicam a missões semanais.")
        if (request.recurrenceType != RecurrenceType.none && request.phases.size != 1) throw ValidationException("Missões recorrentes têm uma única fase.")
        if (request.isCheckin) {
            if (request.recurrenceType != RecurrenceType.monthly || request.phases.size != 1) throw ValidationException("Check-in exige recorrência mensal e uma única fase.")
            val month = YearMonth.from(request.startDate)
            if (request.startDate.dayOfMonth != 1 || request.endDate != month.atEndOfMonth()) throw ValidationException("A vigência do check-in precisa cobrir o mês civil completo.")
        }
    }

    private fun uniqueSlug(title: String): String {
        val base = title.lowercase().trim().replace(Regex("[^a-z0-9]+"), "-").trim('-').ifBlank { "missao" }
        return "${base.take(45).trimEnd('-')}-${ids.next().toString().take(8)}"
    }
}

private fun DayOfWeek.toQuestWeekday(): Weekday = when (this) {
    DayOfWeek.MONDAY -> Weekday.monday
    DayOfWeek.TUESDAY -> Weekday.tuesday
    DayOfWeek.WEDNESDAY -> Weekday.wednesday
    DayOfWeek.THURSDAY -> Weekday.thursday
    DayOfWeek.FRIDAY -> Weekday.friday
    DayOfWeek.SATURDAY -> Weekday.saturday
    DayOfWeek.SUNDAY -> Weekday.sunday
}
