package com.project.pharmacy.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class ApiResponse <T>{
    LocalDateTime timestamp;
    int status;
    String message;
    T data;

    public static  <T> ApiResponse <T> buildCreatedResponse(T data, String message) {
        return ApiResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CREATED.value())
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse <T> buildOkResponse(T data, String message) {
        return ApiResponse.<T>builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.OK.value())
                .message(message)
                .data(data)
                .build();
    }

}
