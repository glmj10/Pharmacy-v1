package com.project.pharmacy.exceptions;

import com.project.pharmacy.dto.response.ErrorResponse;
import com.project.pharmacy.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle CustomException
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ErrorResponse> handleCustomException(CustomException ex, WebRequest request) {
        ErrorResponse errorResponse = buildErrorResponse(ex, request);
        log.warn("Custom exception: {} - {}", ex.getErrorCode(), ex.getMessage());
        return new ResponseEntity<>(errorResponse, ex.getHttpStatus());
    }

    // Handle Spring Validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {

        Map<String, Object> validationDetails = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            validationDetails.put(error.getField(), error.getDefaultMessage());
        });

        CustomException customException = new CustomException(
                ErrorCode.VALIDATION_ERROR,
                HttpStatus.UNPROCESSABLE_ENTITY
        );
        customException.addDetail("validation_errors", validationDetails);

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Validation error: {}", validationDetails);

        return new ResponseEntity<>(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.FORBIDDEN,
                HttpStatus.FORBIDDEN,
                "Bạn không có quyền truy cập tài nguyên này"
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Access denied: {}", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    // Handle all other exceptions
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.INTERNAL_SERVER_ERROR,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "An unexpected error occurred"
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.error("Internal server error: {}", ex.getMessage(), ex);

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Endpoint không tồn tại"
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Resource not found: {}", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    private ErrorResponse buildErrorResponse(CustomException ex, WebRequest request) {
        return ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(ex.getHttpStatus().value())
                .error(ex.getHttpStatus().getReasonPhrase())
                .message(ex.getMessage())
                .path(getRequestPath(request))
                .errorCode(ex.getErrorCode().name())
                .details(ex.getDetails().isEmpty() ? null : ex.getDetails())
                .build();
    }

    private String getRequestPath(WebRequest request) {
        String description = request.getDescription(false);
        return description.replace("uri=", "");
    }
}