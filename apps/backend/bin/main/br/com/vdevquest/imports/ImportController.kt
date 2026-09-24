package br.com.vdevquest.imports

import br.com.vdevquest.auth.CurrentUser
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestHeader
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.multipart.MultipartFile
import java.util.UUID

@RestController
@RequestMapping("/api/v1/imports")
class ImportController(
    private val currentUser: CurrentUser,
    private val imports: XlsxImportService,
    private val idempotency: br.com.vdevquest.quests.IdempotencyService,
) {
    @PostMapping(consumes = ["multipart/form-data"])
    fun upload(@AuthenticationPrincipal jwt: Jwt, @RequestPart file: MultipartFile, @RequestHeader("Idempotency-Key") idempotencyHeader: String): ImportResult {
        val key = runCatching { UUID.fromString(idempotencyHeader) }.getOrElse { throw br.com.vdevquest.shared.ValidationException("Idempotency-Key deve ser um UUID válido.") }
        val content = file.bytes
        return imports.import(currentUser.from(jwt), imports.parse(file), key, idempotency.fingerprint(content))
    }
}

@RestControllerAdvice
class ImportExceptionHandler {
    @ExceptionHandler(ImportValidationException::class)
    fun invalidImport(exception: ImportValidationException): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, exception.message ?: "A planilha contém erros.").apply {
            title = "Planilha inválida"
            setProperty("errors", exception.errors)
        }
}
