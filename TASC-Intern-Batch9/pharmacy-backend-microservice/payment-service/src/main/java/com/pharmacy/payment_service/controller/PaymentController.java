package com.pharmacy.payment_service.controller;

import com.pharmacy.payment_service.service.impl.VnPayService;
import com.pharmacy_backend.common.dto.request.PaymentRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/payments")
public class PaymentController {
    private final VnPayService vnPayService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<String>> handleVnPayReturn(@RequestParam Map<String, String> params) {
        ApiResponse<String> response = vnPayService.handleVnPayReturn(params);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

//    @PreAuthorize("hasRole('USER')")
//    @GetMapping("/recreate-vnpay-url")
//    public ResponseEntity<ApiResponse<String>> createVnPayUrl(@RequestParam Long orderId) {
//        ApiResponse<String> response = vnPayService.recreatePaymentUrl(orderId);
//        return ResponseEntity.status(response.getStatus()).body(response);
//    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/payment-url")
    public ResponseEntity<ApiResponse<String>> createPaymentUrl(@RequestBody PaymentRequest request) {
        String response = vnPayService.createPaymentUrl(request);
        ApiResponse<String> apiResponse = ApiResponse.buildOkResponse(response, "Tạo URL thanh toán thành công");
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/test")
    public String test() {
        return "Payment Service is running!";
    }
}
