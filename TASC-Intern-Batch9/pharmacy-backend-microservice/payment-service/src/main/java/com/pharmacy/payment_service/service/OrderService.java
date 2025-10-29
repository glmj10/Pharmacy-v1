package com.pharmacy.payment_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.OrderFilterRequest;
import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.OrderDetailResponse;
import com.pharmacy_backend.order_service.dto.response.OrderResponse;

import java.util.List;

public interface OrderService {
    ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize, OrderFilterRequest request);
    ApiResponse<PageResponse<List<OrderResponse>>> getMyOrders(int pageIndex, int pageSize, String status);
    ApiResponse<List<OrderDetailResponse>> getOrderDetail(Long orderId);
    ApiResponse<?> createOrder(OrderRequest request);
    ApiResponse<OrderResponse> changeOrderStatus(Long id, String status);
    ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus);
    ApiResponse<Long> getTotalOrder();

    ApiResponse<Long> getAllRevenue();

    ApiResponse<List<OrderResponse>> getFiveNewestOrder();
    ApiResponse<Void> cancelOrder(Long id);
}
