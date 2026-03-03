package com.pharmacy_backend.product_service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ErrorResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

@Component
@Slf4j
public class FeignErrorDecoder implements ErrorDecoder {
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Exception decode(String methodKey, Response response) {
        try (InputStream bodyIs = response.body().asInputStream()) {
            // Đọc JSON thô từ Product Service (cấu trúc ErrorResponse)
            ErrorResponse error = objectMapper.readValue(bodyIs, ErrorResponse.class);

            log.error("Lỗi từ Service khác: {}", error.getMessage());

            // Ném ra CustomException của Order Service
            // Chúng ta lấy trường 'data' (danh sách lỗi SP) để truyền tiếp đi
            return new CustomException(
                    ErrorCode.valueOf(error.getErrorCode()),
                    HttpStatus.valueOf(response.status()),
                    error.getData(), // <--- Quan trọng: Giữ lại danh sách sản phẩm lỗi
                    error.getMessage()
            );
        } catch (Exception e) {
            return new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể giải mã lỗi từ hệ thống");
        }
    }
}
