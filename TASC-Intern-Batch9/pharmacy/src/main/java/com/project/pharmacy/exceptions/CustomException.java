package com.project.pharmacy.exceptions;

import com.project.pharmacy.enums.ErrorCode;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import java.util.HashMap;
import java.util.Map;


@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@AllArgsConstructor
@NoArgsConstructor
public class CustomException extends RuntimeException{
    ErrorCode errorCode;
    HttpStatus httpStatus;
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

    public void addDetail(String key, Object value) {
        this.details.put(key, value);
    }

    public CustomException withHttpStatus(HttpStatus httpStatus) {
        this.httpStatus = httpStatus;
        return this;
    }

}
