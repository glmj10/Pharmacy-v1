package com.pharmacy_backend.common.exceptions;

import com.pharmacy_backend.common.enums.ErrorCode;
import org.springframework.http.HttpStatus;

public class AuthenticationException extends CustomException {
    public AuthenticationException() {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    public AuthenticationException(String message) {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, message);
    }
}
