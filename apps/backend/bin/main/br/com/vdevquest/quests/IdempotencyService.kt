package br.com.vdevquest.quests

import br.com.vdevquest.shared.ConflictException
import com.fasterxml.jackson.databind.ObjectMapper
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Service
import java.security.MessageDigest
import java.util.UUID

@Service
class IdempotencyService(
    private val jdbc: JdbcTemplate,
    private val objectMapper: ObjectMapper,
) {
    fun <T> existing(actorEmail: String, key: UUID, fingerprint: String, responseType: Class<T>): T? {
        val inserted = jdbc.query(
            "insert into private.idempotency_requests(actor_email, idempotency_key, request_hash) values (?, ?, ?) on conflict do nothing returning true",
            { rs, _ -> rs.getBoolean(1) },
            actorEmail,
            key,
            hash(fingerprint),
        ).firstOrNull() == true
        if (inserted) return null
        val row = jdbc.query(
            "select request_hash, response_body::text as response_body from private.idempotency_requests where actor_email = ? and idempotency_key = ? for update",
            { rs, _ -> rs.getString("request_hash") to rs.getString("response_body") },
            actorEmail,
            key,
        ).firstOrNull() ?: throw ConflictException("Não foi possível recuperar a solicitação idempotente.")
        if (row.first != hash(fingerprint)) throw ConflictException("A chave de idempotência já foi usada para outra solicitação.")
        val body = row.second ?: throw ConflictException("A solicitação idêntica ainda está sendo processada.")
        return objectMapper.readValue(body, responseType)
    }

    fun finish(actorEmail: String, key: UUID, result: Any, status: Int = 201) {
        jdbc.update(
            "update private.idempotency_requests set response_status = ?, response_body = ?::jsonb where actor_email = ? and idempotency_key = ?",
            status, objectMapper.writeValueAsString(result), actorEmail, key,
        )
    }

    fun fingerprint(bytes: ByteArray): String = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }

    private fun hash(value: String): String = fingerprint(value.toByteArray())
}
