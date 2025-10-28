package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ProductCheckResponse;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import com.pharmacy_backend.product_service.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/reservations")
public class ReservationController {
    private final StockService stockService;

    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<ReserveResponse>> reserveProduct(@RequestBody List<ReserveRequest> reserveRequestList) {
        ApiResponse<ReserveResponse> response = stockService.reserveProduct(reserveRequestList);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
