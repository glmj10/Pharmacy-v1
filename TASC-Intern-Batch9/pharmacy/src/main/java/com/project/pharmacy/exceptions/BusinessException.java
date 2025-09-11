package com.project.pharmacy.exceptions;

import com.project.pharmacy.enums.ErrorCode;

public class BusinessException extends CustomException{
    public BusinessException(ErrorCode errorCode) {
        super(errorCode);
    }

    public BusinessException(String message) {
        super(ErrorCode.BUSINESS_ERROR, message);
    }
}
