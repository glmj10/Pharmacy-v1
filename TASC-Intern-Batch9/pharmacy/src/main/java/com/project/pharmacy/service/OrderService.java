package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.OrderFilterRequest;
import com.project.pharmacy.dto.request.OrderRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.OrderDetailResponse;
import com.project.pharmacy.dto.response.OrderResponse;
import com.project.pharmacy.dto.response.PageResponse;

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
