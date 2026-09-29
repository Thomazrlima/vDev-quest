package br.com.vdevquest.gamification

import br.com.vdevquest.shared.ConflictException
import br.com.vdevquest.shared.UuidV7
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.jdbc.core.RowMapper
import org.springframework.stereotype.Service
import java.util.UUID

enum class XpMovementType {
    phase_reward,
    checkin_base_reward,
    checkin_milestone_reward,
    user_cancellation_reversal,
    admin_invalidation_reversal,
    mission_invalidation_reversal,
    checkin_bonus_correction,
}

data class XpMovement(val id: UUID, val amount: Int, val movementType: XpMovementType)

@Service
class XpLedgerService(
    private val jdbc: JdbcTemplate,
    private val ids: UuidV7,
) {
    fun grant(userEmail: String, submissionId: UUID, phase: Int, amount: Int, type: XpMovementType): XpMovement {
        require(amount > 0) { "Uma recompensa de XP precisa ser positiva." }
        lockUser(userEmail)
        val id = ids.next()
        jdbc.update(
            "insert into gamification.xp_awards(id, user_email, submission_id, phase_number, amount, movement_type) values (?, ?, ?, ?, ?, ?::gamification.xp_movement_type)",
            id, userEmail, submissionId, phase, amount, type.name,
        )
        jdbc.update("update core.users set xp = xp + ?, updated_at = current_timestamp where email = ?", amount, userEmail)
        return XpMovement(id, amount, type)
    }

    fun reverseOutstanding(submissionId: UUID, reversalType: XpMovementType): Int {
        val awards = jdbc.query(
            """
            select id, user_email, amount, movement_type
            from gamification.xp_awards credit
            where credit.submission_id = ? and credit.amount > 0
              and not exists (select 1 from gamification.xp_awards reversal where reversal.related_award_id = credit.id)
            order by credit.created_at, credit.id
            """.trimIndent(),
            RowMapper { rs, _ -> OutstandingAward(UUID.fromString(rs.getString("id")), rs.getString("user_email"), rs.getInt("amount")) },
            submissionId,
        )
        if (awards.isEmpty()) return 0

        awards.map { it.userEmail }.distinct().sorted().forEach(::lockUser)
        var reversed = 0
        awards.forEach { award ->
            val balance = jdbc.queryForObject("select xp from core.users where email = ? for update", Long::class.java, award.userEmail) ?: 0
            if (balance < award.amount) throw ConflictException("O saldo de XP não permite concluir a reversão de forma segura.")
            jdbc.update(
                "insert into gamification.xp_awards(id, user_email, submission_id, amount, movement_type, related_award_id) values (?, ?, ?, ?, ?::gamification.xp_movement_type, ?)",
                ids.next(), award.userEmail, submissionId, -award.amount, reversalType.name, award.id,
            )
            jdbc.update("update core.users set xp = xp - ?, updated_at = current_timestamp where email = ?", award.amount, award.userEmail)
            reversed += award.amount
        }
        return reversed
    }

    fun adjust(userEmail: String, submissionId: UUID, amount: Int, type: XpMovementType) {
        if (amount == 0) return
        lockUser(userEmail)
        val balance = jdbc.queryForObject("select xp from core.users where email = ? for update", Long::class.java, userEmail) ?: 0
        if (balance + amount < 0) throw ConflictException("O ajuste deixaria o saldo de XP negativo.")
        jdbc.update(
            "insert into gamification.xp_awards(id, user_email, submission_id, amount, movement_type) values (?, ?, ?, ?, ?::gamification.xp_movement_type)",
            ids.next(), userEmail, submissionId, amount, type.name,
        )
        jdbc.update("update core.users set xp = xp + ?, updated_at = current_timestamp where email = ?", amount, userEmail)
    }

    fun reconciliationMismatches(): List<String> = jdbc.queryForList(
        """
        select u.email from core.users u
        left join gamification.xp_awards a on a.user_email = u.email
        group by u.email, u.xp having coalesce(sum(a.amount), 0) <> u.xp
        """.trimIndent(),
        String::class.java,
    )

    private fun lockUser(email: String) {
        jdbc.queryForObject("select email from core.users where email = ? for update", String::class.java, email)
            ?: throw ConflictException("Usuário não encontrado para movimentação de XP.")
    }
}

private data class OutstandingAward(val id: UUID, val userEmail: String, val amount: Int)
