package com.project.pharmacy.exceptions;

import com.project.pharmacy.enums.ErrorCode;
import org.springframework.http.HttpStatus;

public class AuthenticationException extends CustomException {
    public AuthenticationException() {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }

    public AuthenticationException(String message) {
        super(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED, message);
    }
}
