package br.com.vdevquest.quests

import br.com.vdevquest.auth.CurrentUser
import br.com.vdevquest.profile.UserContextService
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
)

data class SubmissionHistoryPage(val items: List<SubmissionHistoryItem>, val nextCursor: String?)

@RestController
@RequestMapping("/api/v1")
class SubmissionHistoryController(
    private val currentUser: CurrentUser,
    private val contexts: UserContextService,
    private val jdbc: JdbcTemplate,
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
                   s.submitted_at, s.status_changed_at, s.invalidation_justification
            from quests.submissions s join quests.missions m on m.id = s.mission_id
            where (?::text is null or s.collaborator_email = ?)
              and (?::uuid is null or (s.submitted_at, s.id) < (select submitted_at, id from quests.submissions where id = ?))
            order by s.submitted_at desc, s.id desc limit ?
            """.trimIndent(),
            { rs, _ -> SubmissionHistoryItem(
                rs.getObject("id", UUID::class.java), rs.getObject("mission_id", UUID::class.java), rs.getString("mission_title"),
                rs.getInt("current_phase"), rs.getObject("occurrence_date", LocalDate::class.java), SubmissionStatus.valueOf(rs.getString("status")),
                rs.getObject("submitted_at", Instant::class.java), rs.getObject("status_changed_at", Instant::class.java), rs.getString("invalidation_justification"),
            ) },
            email, email, cursor, cursor, limit + 1,
        )
        val hasNext = items.size > limit
        return SubmissionHistoryPage(items.take(limit), if (hasNext) items[limit - 1].id.toString() else null)
    }
}
