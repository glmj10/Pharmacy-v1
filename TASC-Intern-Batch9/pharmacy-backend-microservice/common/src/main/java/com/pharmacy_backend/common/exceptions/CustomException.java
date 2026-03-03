package com.pharmacy_backend.common.exceptions;

import com.pharmacy_backend.common.enums.ErrorCode;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;


@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CustomException extends RuntimeException{
    ErrorCode errorCode;
    HttpStatus httpStatus;
    Object data;
    Map<String, Object> details;

    public CustomException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = HttpStatus.BAD_REQUEST;
        details = new HashMap<>();
    }

    public CustomException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = HttpStatus.BAD_REQUEST;
        details = new HashMap<>();
    }

    public CustomException(ErrorCode errorCode, HttpStatus httpStatus) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        details = new HashMap<>();
    }

    public CustomException(ErrorCode errorCode, HttpStatus httpStatus, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.details = new HashMap<>();
    }

    public CustomException(ErrorCode errorCode, Object data, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = HttpStatus.BAD_REQUEST;
        this.data = data;
        this.details = new HashMap<>();
    }

    public CustomException(ErrorCode errorCode, HttpStatus httpStatus, Object data, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
        this.data = data;
        this.details = new HashMap<>();
    }

    public void addDetail(String key, Object value) {
        this.details.put(key, value);
    }

    public CustomException withHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
        return this;
    }

}
