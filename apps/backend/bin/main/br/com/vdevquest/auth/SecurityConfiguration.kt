package br.com.vdevquest.auth

import br.com.vdevquest.shared.AppProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(AppProperties::class)
class SecurityConfiguration {
    @Bean
    fun jwtDecoder(properties: AppProperties): JwtDecoder =
        NimbusJwtDecoder.withJwkSetUri(properties.oidc.jwkSetUri).build().also {
            it.setJwtValidator(JwtValidators.createDefaultWithIssuer(properties.oidc.issuerUri))
        }

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain = http
        .csrf { it.disable() }
        .cors { }
        .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
        .authorizeHttpRequests {
            it.requestMatchers("/actuator/health", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
            it.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            it.requestMatchers("/api/v1/**").authenticated()
            it.anyRequest().denyAll()
        }
        .oauth2ResourceServer { it.jwt { } }
        .build()

    @Bean
    fun corsConfigurationSource(properties: AppProperties): CorsConfigurationSource {
        val configuration = CorsConfiguration().apply {
            allowedOrigins = properties.cors.allowedOrigins
            allowedMethods = listOf("GET", "POST", "PATCH", "PUT", "OPTIONS")
            allowedHeaders = listOf("Authorization", "Content-Type", "Idempotency-Key")
            exposedHeaders = listOf("Location")
            maxAge = 3600
        }
        return UrlBasedCorsConfigurationSource().also { it.registerCorsConfiguration("/**", configuration) }
    }
}
