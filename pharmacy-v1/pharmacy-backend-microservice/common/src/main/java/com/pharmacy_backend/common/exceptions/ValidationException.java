package com.pharmacy_backend.common.exceptions;

import com.pharmacy_backend.common.enums.ErrorCode;
import lombok.Getter;
import lombok.Setter;
import org.springframework.http.HttpStatus;

@Getter
@Setter
public class ValidationException extends CustomException {
    public ValidationException() {
        super(ErrorCode.VALIDATION_ERROR, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    public ValidationException(String field, String message, Object rejectedValue) {
        this();
        super.addDetail("field", field);
        super.addDetail("message", message);
        super.addDetail("rejectedValue", rejectedValue);
    }
}
