package br.com.vdevquest.quests

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.time.LocalDate
import java.util.UUID

data class SubmissionRecord(
    val id: UUID,
    val missionId: UUID,
    val collaboratorEmail: String,
    val currentPhase: Int,
    val occurrenceDate: LocalDate?,
    val status: SubmissionStatus,
)

@Repository
class SubmissionRepository(private val jdbc: JdbcTemplate) {
    private val mapper = RowMapper { rs, _ ->
        SubmissionRecord(
            rs.getObject("id", UUID::class.java),
            rs.getObject("mission_id", UUID::class.java),
            rs.getString("collaborator_email"),
            rs.getInt("current_phase"),
            rs.getObject("occurrence_date", LocalDate::class.java),
            SubmissionStatus.valueOf(rs.getString("status")),
        )
    }

    fun activeForMission(missionId: UUID, email: String): List<SubmissionRecord> = jdbc.query(
        "select id, mission_id, collaborator_email, current_phase, occurrence_date, status from quests.submissions where mission_id = ? and collaborator_email = ? and status = 'active' order by submitted_at, id for update",
        mapper,
        missionId,
        email,
    )

    fun activeForMissionRead(missionId: UUID, email: String): List<SubmissionRecord> = jdbc.query(
        "select id, mission_id, collaborator_email, current_phase, occurrence_date, status from quests.submissions where mission_id = ? and collaborator_email = ? and status = 'active' order by submitted_at, id",
        mapper,
        missionId,
        email,
    )

    fun activeForMission(missionId: UUID): List<SubmissionRecord> = jdbc.query(
        "select id, mission_id, collaborator_email, current_phase, occurrence_date, status from quests.submissions where mission_id = ? and status = 'active' order by collaborator_email, submitted_at, id for update",
        mapper,
        missionId,
    )

    fun find(id: UUID, lock: Boolean = false): SubmissionRecord? = jdbc.query(
        "select id, mission_id, collaborator_email, current_phase, occurrence_date, status from quests.submissions where id = ?${if (lock) " for update" else ""}", mapper, id,
    ).firstOrNull()

    fun insert(id: UUID, missionId: UUID, email: String, occurrenceDate: LocalDate?) {
        jdbc.update("insert into quests.submissions(id, mission_id, collaborator_email, occurrence_date) values (?, ?, ?, ?)", id, missionId, email, occurrenceDate)
    }

    fun advance(id: UUID, phase: Int) {
        jdbc.update("update quests.submissions set current_phase = ? where id = ? and status = 'active'", phase, id)
    }

    fun addEvidence(id: UUID, phase: Int, payload: EvidencePayload) {
        jdbc.update(
            """
            insert into quests.submission_phase_evidences(submission_id, phase_number, evidence_value, attachment_object_key, original_file_name, mime_type, file_size_bytes)
            values (?, ?, ?, ?, ?, ?, ?)
            """.trimIndent(),
            id, phase, payload.value, payload.file?.objectKey, payload.file?.originalFileName, payload.file?.mimeType, payload.file?.size,
        )
    }

    fun transition(id: UUID, status: SubmissionStatus, actorEmail: String, source: String, justification: String? = null) {
        jdbc.update(
            """
            update quests.submissions
            set status = ?::quests.submission_status, status_changed_at = now(), status_changed_by_email = ?,
                status_change_source = ?::quests.submission_status_change_source, invalidation_justification = ?
            where id = ? and status = 'active'
            """.trimIndent(),
            status.name, actorEmail, source, justification, id,
        )
    }

    fun userXp(email: String): Long = jdbc.queryForObject("select xp from core.users where email = ?", Long::class.java, email) ?: 0

    fun evidenceObjectKey(submissionId: UUID, phase: Int): String? = jdbc.query(
        "select attachment_object_key from quests.submission_phase_evidences where submission_id = ? and phase_number = ?",
        { rs, _ -> rs.getString("attachment_object_key") },
        submissionId,
        phase,
    ).firstOrNull()
}

data class EvidencePayload(val value: String?, val file: StoredEvidence?)
