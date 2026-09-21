package br.com.vdevquest.shared

import jakarta.servlet.http.HttpServletRequest
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
    @ExceptionHandler(DomainException::class)
    fun domain(exception: DomainException, request: HttpServletRequest): ProblemDetail =
        ProblemDetail.forStatusAndDetail(exception.status, exception.message).apply {
            title = exception.status.reasonPhrase
            instance = java.net.URI.create(request.requestURI)
        }
}
