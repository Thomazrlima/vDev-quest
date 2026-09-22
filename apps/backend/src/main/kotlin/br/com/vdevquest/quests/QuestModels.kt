package br.com.vdevquest.quests

import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import jakarta.validation.constraints.Size
import java.time.LocalDate
import java.util.UUID

enum class EvidenceType { photo, pdf, link, text }
enum class RecurrenceType { none, daily, weekly, monthly }
enum class Weekday { sunday, monday, tuesday, wednesday, thursday, friday, saturday }
enum class MissionStatus { active, invalidated }
enum class SubmissionStatus { active, cancelled, invalidated }

data class PhaseInput(
    @field:Positive val number: Int,
    @field:NotBlank @field:Size(max = 120) val title: String,
    @field:Positive val xpReward: Int,
)

data class MissionRequest(
    @field:NotBlank @field:Size(max = 140) val title: String,
    @field:NotBlank @field:Size(max = 4000) val description: String,
    @field:NotNull val evidenceType: EvidenceType,
    @field:NotNull val startDate: LocalDate,
    @field:NotNull val endDate: LocalDate,
    @field:NotNull val recurrenceType: RecurrenceType,
    val weekdays: Set<Weekday> = emptySet(),
    val isCheckin: Boolean = false,
    val allowsMultipleSubmissions: Boolean = false,
    @field:NotEmpty val phases: List<@Valid PhaseInput>,
)

data class MissionPhaseResponse(val number: Int, val title: String, val xpReward: Int)
data class MissionResponse(
    val id: UUID,
    val slug: String,
    val title: String,
    val description: String,
    val evidenceType: EvidenceType,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val recurrenceType: RecurrenceType,
    val weekdays: Set<Weekday>,
    val isCheckin: Boolean,
    val allowsMultipleSubmissions: Boolean,
    val status: MissionStatus,
    val hasSubmissions: Boolean,
    val phases: List<MissionPhaseResponse>,
)

data class MuralMissionResponse(
    val id: UUID,
    val title: String,
    val description: String,
    val evidenceType: EvidenceType,
    val status: String,
    val submissionId: UUID?,
    val nextPhase: MissionPhaseResponse?,
    val occurrenceDate: LocalDate?,
    val isCheckin: Boolean,
    val allowsMultipleSubmissions: Boolean,
    val endDate: LocalDate,
    val xpReward: Int,
    val phaseCount: Int,
)

data class SubmitResult(
    val submissionId: UUID,
    val currentPhase: Int,
    val completed: Boolean,
    val xpAwarded: Int,
    val totalXp: Long,
)
