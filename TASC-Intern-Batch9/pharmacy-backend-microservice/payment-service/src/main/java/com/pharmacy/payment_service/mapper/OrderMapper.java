package com.pharmacy.payment_service.mapper;

import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.OrderDetailResponse;
import com.pharmacy_backend.order_service.dto.response.OrderResponse;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.OrderDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "customerName", ignore = true)
    @Mapping(target = "customerPhoneNumber", ignore = true)
    @Mapping(target = "customerAddress", ignore = true)
    @Mapping(target = "totalPrice", ignore = true)
    @Mapping(target = "orderDetails", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "paymentStatus", constant = "PENDING")
    Order toOrder(OrderRequest request);

    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);

    OrderResponse toOrderResponse(Order order);
}
