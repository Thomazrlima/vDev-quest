package br.com.vdevquest.auth

import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class RequestDatabaseContext(private val jdbc: JdbcTemplate) {
    /** Must be called inside the short transaction that performs the domain action. */
    fun apply(email: String, role: String) {
        jdbc.queryForObject("select set_config('app.user_email', ?, true)", String::class.java, email)
        jdbc.queryForObject("select set_config('app.user_role', ?, true)", String::class.java, role)
    }
}
