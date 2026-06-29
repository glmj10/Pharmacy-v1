package com.pharmacy_backend.api_gateway.exceptions;

import com.pharmacy_backend.common.exceptions.BaseExceptionHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends BaseExceptionHandler {
}
