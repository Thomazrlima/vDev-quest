package br.com.vdevquest.quests

import br.com.vdevquest.shared.AppProperties
import br.com.vdevquest.shared.UuidV7
import br.com.vdevquest.shared.ValidationException
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.S3Configuration
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import software.amazon.awssdk.services.s3.model.GetObjectRequest
import software.amazon.awssdk.services.s3.presigner.S3Presigner
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest
import java.net.URI
import java.time.Duration
import java.util.UUID

data class StoredEvidence(val objectKey: String, val originalFileName: String, val mimeType: String, val size: Long)

@Configuration
class StorageConfiguration {
    private fun credentials(properties: AppProperties) = StaticCredentialsProvider.create(
        AwsBasicCredentials.create(properties.storage.accessKey, properties.storage.secretKey),
    )

    @Bean
    fun s3Client(properties: AppProperties): S3Client = S3Client.builder()
        .endpointOverride(URI.create(properties.storage.endpoint))
        .region(Region.of(properties.storage.region))
        .credentialsProvider(credentials(properties))
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
        .build()

    @Bean
    fun s3Presigner(properties: AppProperties): S3Presigner = S3Presigner.builder()
        .endpointOverride(URI.create(properties.storage.publicEndpoint))
        .region(Region.of(properties.storage.region))
        .credentialsProvider(credentials(properties))
        .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
        .build()
}

@Service
class EvidenceStorage(
    private val s3: S3Client,
    private val presigner: S3Presigner,
    private val properties: AppProperties,
    private val ids: UuidV7,
) {
    fun upload(type: EvidenceType, file: MultipartFile): StoredEvidence {
        val mime = file.contentType?.lowercase() ?: throw ValidationException("O arquivo precisa informar seu tipo MIME.")
        if (file.isEmpty || file.size > 3L * 1024 * 1024) throw ValidationException("O arquivo deve ter entre 1 byte e 3 MiB.")
        val accepted = when (type) {
            EvidenceType.photo -> setOf("image/png", "image/jpeg")
            EvidenceType.pdf -> setOf("application/pdf")
            EvidenceType.link, EvidenceType.text -> emptySet()
        }
        if (mime !in accepted) throw ValidationException("O arquivo enviado não corresponde ao tipo de evidência solicitado.")
        val fileName = file.originalFilename?.takeIf { it.isNotBlank() }?.take(255) ?: "evidencia"
        val key = "evidence/${ids.next()}/${sanitizeFileName(fileName)}"
        s3.putObject(
            PutObjectRequest.builder().bucket(properties.storage.bucket).key(key).contentType(mime).contentLength(file.size).build(),
            RequestBody.fromInputStream(file.inputStream, file.size),
        )
        return StoredEvidence(key, fileName, mime, file.size)
    }

    fun deleteQuietly(key: String) {
        runCatching { s3.deleteObject(DeleteObjectRequest.builder().bucket(properties.storage.bucket).key(key).build()) }
    }

    fun temporaryDownloadUrl(key: String): String = presigner.presignGetObject(
        GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofMinutes(properties.storage.presignMinutes))
            .getObjectRequest(GetObjectRequest.builder().bucket(properties.storage.bucket).key(key).build())
            .build(),
    ).url().toString()

    private fun sanitizeFileName(name: String): String = name.replace(Regex("[^A-Za-z0-9._-]"), "-").takeLast(180)
}
