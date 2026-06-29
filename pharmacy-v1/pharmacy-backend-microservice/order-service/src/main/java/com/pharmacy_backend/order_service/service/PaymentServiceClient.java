package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.request.PaymentRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.order_service.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service", configuration = FeignClientConfig.class)
public interface PaymentServiceClient {
    @PostMapping("/payments/payment-url")
    ApiResponse<String> createPaymentUrl(@RequestBody PaymentRequest request);
}
