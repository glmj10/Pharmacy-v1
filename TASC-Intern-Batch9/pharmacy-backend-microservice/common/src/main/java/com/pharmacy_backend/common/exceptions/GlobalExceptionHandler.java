package com.pharmacy_backend.common.exceptions;

import com.pharmacy_backend.common.dto.response.ErrorResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.nio.file.AccessDeniedException;
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

    @ExceptionHandler(UnsupportedOperationException.class)
    public ResponseEntity<ErrorResponse> handleUnsupportedOperationException(UnsupportedOperationException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.UNSUPPORTED_OPERATION,
                HttpStatus.BAD_REQUEST,
                ex.getMessage() != null ? ex.getMessage() : "Phương thức không được hỗ trợ"
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Unsupported operation: {}", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorResponse> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.UNSUPPORTED_MEDIA_TYPE,
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "Loại phương tiện không được hỗ trợ"
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Unsupported media type: {}", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestPartException(MissingServletRequestPartException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.BAD_REQUEST,
                HttpStatus.BAD_REQUEST,
                "Thiếu phần yêu cầu: " + ex.getRequestPartName()
        );

        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Missing request part: {}", ex.getMessage());

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
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