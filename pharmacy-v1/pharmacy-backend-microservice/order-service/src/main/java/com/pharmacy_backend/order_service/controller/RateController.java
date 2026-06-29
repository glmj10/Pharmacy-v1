package com.pharmacy_backend.order_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.RateRequest;
import com.pharmacy_backend.order_service.dto.response.RateResponse;
import com.pharmacy_backend.order_service.service.RateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/rates")
public class RateController {
    private final RateService rateService;

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<PageResponse<List<RateResponse>>>> getRatesByProductId(
            @PathVariable Long productId, @RequestParam(defaultValue = "1") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Integer rating
    ) {
        ApiResponse<PageResponse<List<RateResponse>>> response = rateService.getRatesByProductId
                (
                        productId, pageIndex, pageSize, rating
                );
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createRateForProduct(@RequestBody @Valid RateRequest request) {
        ApiResponse<Void> response = rateService.createRate(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
