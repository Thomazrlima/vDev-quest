package br.com.vdevquest.shared

import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.multipart.MaxUploadSizeExceededException
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

open class DomainException(val status: HttpStatus, override val message: String) : RuntimeException(message)
class NotFoundException(message: String) : DomainException(HttpStatus.NOT_FOUND, message)
class ConflictException(message: String) : DomainException(HttpStatus.CONFLICT, message)
class ForbiddenException(message: String) : DomainException(HttpStatus.FORBIDDEN, message)
class ValidationException(message: String) : DomainException(HttpStatus.UNPROCESSABLE_ENTITY, message)

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun invalidFields(exception: MethodArgumentNotValidException, request: HttpServletRequest): ProblemDetail {
        val first = exception.bindingResult.fieldErrors.firstOrNull()
        val detail = first?.let { "${it.field}: ${it.defaultMessage ?: "valor inválido"}" }
            ?: "Confira os campos enviados."
        return ProblemDetail.forStatusAndDetail(HttpStatus.UNPROCESSABLE_ENTITY, detail).apply {
            title = "Dados inválidos"
            instance = java.net.URI.create(request.requestURI)
        }
    }

    @ExceptionHandler(MaxUploadSizeExceededException::class)
    fun fileTooLarge(request: HttpServletRequest): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.PAYLOAD_TOO_LARGE, "O arquivo excede o limite permitido de 3 MiB.").apply {
            title = "Arquivo muito grande"
            instance = java.net.URI.create(request.requestURI)
        }

    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun malformedBody(request: HttpServletRequest): ProblemDetail =
        ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "O corpo da requisição contém dados inválidos.").apply {
            title = "Requisição inválida"
            instance = java.net.URI.create(request.requestURI)
        }

    @ExceptionHandler(DomainException::class)
    fun domain(exception: DomainException, request: HttpServletRequest): ProblemDetail =
        ProblemDetail.forStatusAndDetail(exception.status, exception.message).apply {
            title = exception.status.reasonPhrase
            instance = java.net.URI.create(request.requestURI)
        }
}
