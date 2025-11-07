package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.order_service.dto.request.OrderFilterRequest;
import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.CartItemResponse;
import com.pharmacy_backend.order_service.dto.response.OrderDetailResponse;
import com.pharmacy_backend.order_service.dto.response.OrderResponse;
import com.pharmacy_backend.order_service.entity.OrderDetail;

import java.util.ArrayList;
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

    static List<OrderDetailEvent> mapToOrderDetailEvents(List<OrderDetail> orderDetails) {
        List<OrderDetailEvent> orderDetailEvents = new ArrayList<>();
        for (OrderDetail orderDetail : orderDetails) {
            OrderDetailEvent orderDetailEvent = new OrderDetailEvent();
            orderDetailEvent.setProductId(orderDetail.getProduct().getId());
            orderDetailEvent.setQuantity(orderDetail.getQuantity());
            orderDetailEvent.setPriceAtOrder(orderDetail.getPriceAtOrder());
            orderDetailEvents.add(orderDetailEvent);
        }
        return orderDetailEvents;
    }

    static List<OrderDetailEvent> mapToOrderDetailEventsFromCartItems(List<CartItemResponse> cartItems) {
        List<OrderDetailEvent> orderDetailEvents = new ArrayList<>();
        for (CartItemResponse cartItem : cartItems) {
            OrderDetailEvent orderDetailEvent = new OrderDetailEvent();
            orderDetailEvent.setProductId(cartItem.getProduct().getId());
            orderDetailEvent.setQuantity(cartItem.getQuantity());
            orderDetailEvent.setPriceAtOrder(cartItem.getProduct().getPriceNew());
            orderDetailEvents.add(orderDetailEvent);
        }
        return orderDetailEvents;
    }
}
