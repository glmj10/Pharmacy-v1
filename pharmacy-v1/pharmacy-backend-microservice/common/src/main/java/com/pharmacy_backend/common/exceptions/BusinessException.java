package com.pharmacy_backend.common.exceptions;


import com.pharmacy_backend.common.enums.ErrorCode;
import org.springframework.http.HttpStatus;

public class BusinessException extends CustomException{
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(ErrorCode errorCode, HttpStatus httpStatus, Object data, String customMessage) {
        super(errorCode, httpStatus, data, customMessage);
    }
    public BusinessException(String message) {
        super(ErrorCode.BUSINESS_ERROR, message);
    }
}
