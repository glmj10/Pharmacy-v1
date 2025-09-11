package com.project.pharmacy.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.Map;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    LocalDateTime timestamp;
    int status;
    String error;
    String message;
    String path;
    String errorCode;
    Map<String, Object> details;
}
