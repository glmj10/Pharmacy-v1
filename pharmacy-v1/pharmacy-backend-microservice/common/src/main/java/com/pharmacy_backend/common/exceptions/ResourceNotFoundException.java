package com.pharmacy_backend.common.exceptions;

import com.pharmacy_backend.common.enums.ErrorCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResourceNotFoundException extends CustomException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(ErrorCode.RESOURCE_NOT_FOUND);
        super.addDetail("resourceName", resourceName);
        super.addDetail("fieldName", fieldName);
        super.addDetail("fieldValue", fieldValue);
    }
}
