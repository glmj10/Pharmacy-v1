package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.OrderRequest;
import com.project.pharmacy.dto.response.OrderDetailResponse;
import com.project.pharmacy.dto.response.OrderResponse;
import com.project.pharmacy.entity.Order;
import com.project.pharmacy.entity.OrderDetail;
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
    @Mapping(target = "cart", ignore = true)
    Order toOrder(OrderRequest request);

    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);

    OrderResponse toOrderResponse(Order order);
}
