package com.pharmacy_backend.common.exceptions;


import com.pharmacy_backend.common.enums.ErrorCode;

public class BusinessException extends CustomException{
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(String message) {
        super(ErrorCode.BUSINESS_ERROR, message);
    }
}
