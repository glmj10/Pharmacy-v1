package com.project.pharmacy.controller;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.service.impl.VnPayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment")
public class PaymentController {
    private final VnPayService vnPayService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/vnpay-return")
    public ResponseEntity<ApiResponse<String>> handleVnPayReturn(@RequestParam Map<String, String> params) {
        ApiResponse<String> response = vnPayService.handleVnPayReturn(params);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/recreate-vnpay-url")
    public ResponseEntity<ApiResponse<String>> createVnPayUrl(@RequestParam Long orderId) {
        ApiResponse<String> response = vnPayService.recreatePaymentUrl(orderId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
