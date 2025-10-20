package com.pharmacy_backend.product_service.exceptions;

import com.pharmacy_backend.common.dto.response.ErrorResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.BaseExceptionHandler;
import com.pharmacy_backend.common.exceptions.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends BaseExceptionHandler {

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoResourceFoundException(NoResourceFoundException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.RESOURCE_NOT_FOUND,
                HttpStatus.NOT_FOUND,
                "Endpoint không tồn tại"
        );
        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("No resource found: {}", ex.getResourcePath());
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponse> handleMissingServletRequestPartException(MissingServletRequestPartException ex, WebRequest request) {
        CustomException customException = new CustomException(
                ErrorCode.MISSING_REQUEST_PART,
                HttpStatus.BAD_REQUEST,
                "Thiếu phần yêu cầu: " + ex.getRequestPartName()
        );
        ErrorResponse errorResponse = buildErrorResponse(customException, request);
        log.warn("Missing request part: {}", ex.getRequestPartName());
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
}
