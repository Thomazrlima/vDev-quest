package br.com.vdevquest.quests

import br.com.vdevquest.gamification.XpLedgerService
import br.com.vdevquest.gamification.XpMovementType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class CheckinService(
    private val jdbc: JdbcTemplate,
    private val ledger: XpLedgerService,
) {
    /** Recomputes only the milestone portion; each submitted phase already owns its base XP movement. */
    fun recalculate(missionId: UUID, userEmail: String) {
        val count = jdbc.queryForObject(
            "select count(distinct occurrence_date) from quests.submissions where mission_id = ? and collaborator_email = ? and status = 'active'",
            Int::class.java,
            missionId,
            userEmail,
        ) ?: 0
        val target = (if (count >= 10) 10 else 0) + (if (count >= 15) 5 else 0) + (if (count >= 20) 5 else 0)
        val current = jdbc.queryForObject(
            """
            select coalesce(sum(a.amount), 0)
            from gamification.xp_awards a
            join quests.submissions s on s.id = a.submission_id
            where s.mission_id = ? and s.collaborator_email = ? and s.status = 'active'
              and a.movement_type in ('checkin_milestone_reward', 'checkin_bonus_correction')
            """.trimIndent(),
            Int::class.java,
            missionId,
            userEmail,
        ) ?: 0
        val delta = target - current
        if (delta == 0) return
        val anchor = jdbc.queryForObject(
            "select id from quests.submissions where mission_id = ? and collaborator_email = ? and status = 'active' order by occurrence_date, id limit 1",
            UUID::class.java,
            missionId,
            userEmail,
        ) ?: return
        ledger.adjust(userEmail, anchor, delta, if (delta > 0) XpMovementType.checkin_milestone_reward else XpMovementType.checkin_bonus_correction)
    }
}
