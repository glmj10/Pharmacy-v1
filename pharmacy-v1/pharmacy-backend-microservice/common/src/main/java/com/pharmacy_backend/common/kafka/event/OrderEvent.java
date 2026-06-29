package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderEvent {
    Long orderId;
    String customerName;
    String customerPhoneNumber;
    String customerAddress;
    String userEmail;
    LocalDateTime createdAt;
    long totalPrice;
    List<OrderDetailEvent> orderDetailEventList;
}
