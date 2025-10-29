package com.pharmacy.payment_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.OrderFilterRequest;
import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.OrderDetailResponse;
import com.pharmacy_backend.order_service.dto.response.OrderResponse;
import com.pharmacy_backend.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/my-orders")
    public ResponseEntity<ApiResponse<PageResponse<List<OrderResponse>>>> getMyOrders(@RequestParam(required = false, defaultValue = "1") int pageIndex,
                                                                                      @RequestParam (required = false, defaultValue = "10") int pageSize,
                                                                                      @RequestParam(required = false) String status) {
        ApiResponse<PageResponse<List<OrderResponse>>> response = orderService.getMyOrders(pageIndex, pageSize, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/detail/{id}")
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getOrderDetail(@PathVariable Long id) {
        ApiResponse<List<OrderDetailResponse>> response = orderService.getOrderDetail(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<OrderResponse>>>> getAllOrders(
            @RequestParam(defaultValue = "1", required = false) int pageIndex,
            @RequestParam(defaultValue = "10", required = false) int pageSize,
            @ModelAttribute OrderFilterRequest request) {
        ApiResponse<PageResponse<List<OrderResponse>>> response = orderService.getAllOrders(pageIndex, pageSize, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createOrder(@RequestBody @Valid OrderRequest request) {
        ApiResponse<?> response = orderService.createOrder(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/status/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> changeOrderStatus(@PathVariable Long id,
                                                                 @RequestParam(name = "status") String status) {
        ApiResponse<OrderResponse> response = orderService.changeOrderStatus(id, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/cancel/{id}")
    public ResponseEntity<ApiResponse<?>> cancelOrder(@PathVariable Long id) {
        ApiResponse<?> response = orderService.cancelOrder(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/payment-status/{id}")
    public ResponseEntity<ApiResponse<OrderResponse>> changePaymentStatus(@PathVariable Long id,
                                                                        @RequestParam(name = "status") String paymentStatus) {
        ApiResponse<OrderResponse> response = orderService.changePaymentStatus(id, paymentStatus);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/statistic/total")
    public ResponseEntity<ApiResponse<Long>> getTotalOrder() {
        ApiResponse<Long> response = orderService.getTotalOrder();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/statistic/allRevenue")
    public ResponseEntity<ApiResponse<Long>> getAllRevenue() {
        ApiResponse<Long> response = orderService.getAllRevenue();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/statistic/newest")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getFiveNewestOrder() {
        ApiResponse<List<OrderResponse>> response = orderService.getFiveNewestOrder();
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
