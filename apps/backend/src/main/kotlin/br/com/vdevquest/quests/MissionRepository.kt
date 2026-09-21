package br.com.vdevquest.quests

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Repository
import java.sql.ResultSet
import java.time.LocalDate
import java.util.UUID

data class MissionRecord(
    val id: UUID,
    val slug: String,
    val createdByEmail: String,
    val title: String,
    val description: String,
    val evidenceType: EvidenceType,
    val startDate: LocalDate,
    val endDate: LocalDate,
    val recurrenceType: RecurrenceType,
    val isCheckin: Boolean,
    val allowsMultipleSubmissions: Boolean,
    val status: MissionStatus,
)

@Repository
class MissionRepository(private val jdbc: JdbcTemplate) {
    private val missionMapper = RowMapper { rs: ResultSet, _: Int -> rs.toMission() }

    fun find(id: UUID, lock: Boolean = false): MissionRecord? = jdbc.query(
        "select id, slug, created_by_email, title, description, evidence_type, start_date, end_date, recurrence_type, is_checkin, allows_multiple_submissions, status from quests.missions where id = ?${if (lock) " for update" else ""}",
        missionMapper,
        id,
    ).firstOrNull()

    fun list(): List<MissionRecord> = jdbc.query(
        "select id, slug, created_by_email, title, description, evidence_type, start_date, end_date, recurrence_type, is_checkin, allows_multiple_submissions, status from quests.missions order by created_at desc",
        missionMapper,
    )

    fun listAvailable(today: LocalDate): List<MissionRecord> = jdbc.query(
        "select id, slug, created_by_email, title, description, evidence_type, start_date, end_date, recurrence_type, is_checkin, allows_multiple_submissions, status from quests.missions where status = 'active' and start_date <= ? and end_date >= ? order by created_at desc",
        missionMapper,
        today,
        today,
    )

    fun insert(mission: MissionRecord, phases: List<PhaseInput>, weekdays: Set<Weekday>) {
        jdbc.update(
            """
            insert into quests.missions(id, slug, created_by_email, title, description, evidence_type, start_date, end_date, recurrence_type, is_checkin, allows_multiple_submissions)
            values (?, ?, ?, ?, ?, ?::quests.evidence_type, ?, ?, ?::quests.recurrence_type, ?, ?)
            """.trimIndent(),
            mission.id, mission.slug, mission.createdByEmail, mission.title, mission.description, mission.evidenceType.name,
            mission.startDate, mission.endDate, mission.recurrenceType.name, mission.isCheckin, mission.allowsMultipleSubmissions,
        )
        replaceRules(mission.id, phases, weekdays)
    }

    fun updateText(id: UUID, title: String, description: String) {
        jdbc.update("update quests.missions set title = ?, description = ? where id = ?", title, description, id)
    }

    fun replaceRules(id: UUID, phases: List<PhaseInput>, weekdays: Set<Weekday>) {
        jdbc.update("delete from quests.mission_weekdays where mission_id = ?", id)
        jdbc.update("delete from quests.mission_phases where mission_id = ?", id)
        phases.forEach { phase ->
            jdbc.update("insert into quests.mission_phases(mission_id, phase_number, phase_title, xp_reward) values (?, ?, ?, ?)", id, phase.number, phase.title.trim(), phase.xpReward)
        }
        weekdays.forEach { weekday -> jdbc.update("insert into quests.mission_weekdays(mission_id, weekday) values (?, ?::quests.weekday)", id, weekday.name) }
    }

    fun phases(id: UUID): List<MissionPhaseResponse> = jdbc.query(
        "select phase_number, phase_title, xp_reward from quests.mission_phases where mission_id = ? order by phase_number",
        RowMapper { rs, _ -> MissionPhaseResponse(rs.getInt("phase_number"), rs.getString("phase_title"), rs.getInt("xp_reward")) },
        id,
    )

    fun weekdays(id: UUID): Set<Weekday> = jdbc.queryForList("select weekday::text from quests.mission_weekdays where mission_id = ?", String::class.java, id).mapTo(linkedSetOf()) { Weekday.valueOf(it) }

    fun hasSubmissions(id: UUID): Boolean = jdbc.queryForObject("select exists(select 1 from quests.submissions where mission_id = ?)", Boolean::class.java, id) ?: false

    fun invalidate(id: UUID, managerEmail: String) {
        jdbc.update("update quests.missions set status = 'invalidated', invalidated_at = now(), invalidated_by_email = ? where id = ? and status = 'active'", managerEmail, id)
    }

    fun isWeeklyOccurrence(id: UUID, weekday: Weekday): Boolean = jdbc.queryForObject(
        "select exists(select 1 from quests.mission_weekdays where mission_id = ? and weekday = ?::quests.weekday)",
        Boolean::class.java,
        id,
        weekday.name,
    ) ?: false
}

private fun ResultSet.toMission(): MissionRecord = MissionRecord(
    id = getObject("id", UUID::class.java),
    slug = getString("slug"),
    createdByEmail = getString("created_by_email"),
    title = getString("title"),
    description = getString("description"),
    evidenceType = EvidenceType.valueOf(getString("evidence_type")),
    startDate = getObject("start_date", LocalDate::class.java),
    endDate = getObject("end_date", LocalDate::class.java),
    recurrenceType = RecurrenceType.valueOf(getString("recurrence_type")),
    isCheckin = getBoolean("is_checkin"),
    allowsMultipleSubmissions = getBoolean("allows_multiple_submissions"),
    status = MissionStatus.valueOf(getString("status")),
)
