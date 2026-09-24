package br.com.vdevquest.shared

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock
import java.time.ZoneId

@ConfigurationProperties("app")
data class AppProperties(
    val cors: CorsProperties,
    val clockZone: String,
    val oidc: OidcProperties,
    val storage: StorageProperties,
) {
    data class CorsProperties(val allowedOrigins: List<String>)
    data class OidcProperties(val issuerUri: String, val jwkSetUri: String)
    data class StorageProperties(
        val endpoint: String,
        val publicEndpoint: String,
        val region: String,
        val bucket: String,
        val accessKey: String,
        val secretKey: String,
        val presignMinutes: Long,
    )
}

@Configuration
class AppConfiguration {
    @Bean
    fun appClock(properties: AppProperties): Clock = Clock.system(ZoneId.of(properties.clockZone))
}
