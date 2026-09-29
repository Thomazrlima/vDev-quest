package br.com.vdevquest.quests

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.profile.UserContextService
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

data class SubmissionHistoryItem(
    val id: UUID,
    val missionId: UUID,
    val missionTitle: String,
    val currentPhase: Int,
    val occurrenceDate: LocalDate?,
    val status: SubmissionStatus,
    val submittedAt: Instant,
    val statusChangedAt: Instant?,
    val invalidationJustification: String?,
    val collaboratorName: String,
    val collaboratorEmail: String,
    val evidenceType: EvidenceType,
    val evidenceValue: String?,
    val originalFileName: String?,
    val evidencePhase: Int?,
    val missionDescription: String,
    val missionEndDate: LocalDate,
    val missionXp: Long,
    val missionPhaseCount: Int,
    val evidences: List<PhaseEvidenceHistory>,
)
data class PhaseEvidenceHistory(val phaseNumber: Int, val evidenceValue: String?, val originalFileName: String?, val submittedAt: Instant)

data class SubmissionHistoryPage(val items: List<SubmissionHistoryItem>, val nextCursor: String?)

@RestController
@RequestMapping("/api/v1")
class SubmissionHistoryController(
    private val currentUser: CurrentUser,
    private val contexts: UserContextService,
    private val jdbc: JdbcTemplate,
    private val objectMapper: ObjectMapper,
) {
    @GetMapping("/me/submissions")
    @Transactional
    fun mine(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(required = false) cursor: UUID?,
        @RequestParam(defaultValue = "20") limit: Int,
    ): SubmissionHistoryPage {
        val actor = contexts.establish(currentUser.from(jwt))
        return list(actor.email, cursor, limit)
    }

    @GetMapping("/admin/submissions")
    @Transactional
    fun all(
        @AuthenticationPrincipal jwt: Jwt,
        @RequestParam(required = false) cursor: UUID?,
        @RequestParam(defaultValue = "20") limit: Int,
    ): SubmissionHistoryPage {
        val actor = contexts.establish(currentUser.from(jwt)); actor.requireManager()
        return list(null, cursor, limit)
    }

    private fun list(email: String?, cursor: UUID?, requestedLimit: Int): SubmissionHistoryPage {
        val limit = requestedLimit.coerceIn(1, 50)
        val items = jdbc.query(
            """
            select s.id, s.mission_id, m.title as mission_title, s.current_phase, s.occurrence_date, s.status,
                   s.submitted_at, s.status_changed_at, s.invalidation_justification,
                   u.name as collaborator_name, s.collaborator_email, m.evidence_type::text as evidence_type,
                   phase_history.evidences::text as evidences,
                   m.description as mission_description, m.end_date as mission_end_date,
                   (select coalesce(sum(p.xp_reward), 0) from quests.mission_phases p where p.mission_id = m.id) as mission_xp,
                   (select count(*) from quests.mission_phases p where p.mission_id = m.id) as mission_phase_count
            from quests.submissions s
            join quests.missions m on m.id = s.mission_id
            join core.users u on u.email = s.collaborator_email
            left join lateral (
                select coalesce(jsonb_agg(jsonb_build_object(
                    'phaseNumber', phase_number,
                    'evidenceValue', evidence_value,
                    'originalFileName', original_file_name,
                    'submittedAt', submitted_at
                ) order by phase_number), '[]'::jsonb) as evidences
                from quests.submission_phase_evidences
                where submission_id = s.id
            ) phase_history on true
            where (?::text is null or s.collaborator_email = ?)
              and (?::uuid is null or (s.submitted_at, s.id) < (select submitted_at, id from quests.submissions where id = ?))
            order by s.submitted_at desc, s.id desc limit ?
            """.trimIndent(),
            { rs, _ ->
                val evidences: List<PhaseEvidenceHistory> = objectMapper.readValue(
                    rs.getString("evidences"), objectMapper.typeFactory.constructCollectionType(List::class.java, PhaseEvidenceHistory::class.java),
                )
                SubmissionHistoryItem(
                rs.getObject("id", UUID::class.java), rs.getObject("mission_id", UUID::class.java), rs.getString("mission_title"),
                rs.getInt("current_phase"), rs.getObject("occurrence_date", LocalDate::class.java), SubmissionStatus.valueOf(rs.getString("status")),
                rs.getTimestamp("submitted_at").toInstant(), rs.getTimestamp("status_changed_at")?.toInstant(), rs.getString("invalidation_justification"),
                rs.getString("collaborator_name"), rs.getString("collaborator_email"), EvidenceType.valueOf(rs.getString("evidence_type")), evidences.lastOrNull()?.evidenceValue,
                evidences.lastOrNull()?.originalFileName, evidences.lastOrNull()?.phaseNumber,
                rs.getString("mission_description"), rs.getObject("mission_end_date", LocalDate::class.java), rs.getLong("mission_xp"), rs.getInt("mission_phase_count"),
                evidences,
            ) },
            email, email, cursor, cursor, limit + 1,
        )
        val hasNext = items.size > limit
        return SubmissionHistoryPage(items.take(limit), if (hasNext) items[limit - 1].id.toString() else null)
    }
}
