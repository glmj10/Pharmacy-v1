package com.pharmacy_backend.order_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.enums.PartitionKeyEnum;
import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import com.pharmacy_backend.common.kafka.event.PaymentEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.OrderDetail;
import com.pharmacy_backend.order_service.repository.OrderDetailRepository;
import com.pharmacy_backend.order_service.repository.OrderRepository;
import com.pharmacy_backend.order_service.service.OrderService;
import com.pharmacy_backend.order_service.service.OutboxService;
import com.pharmacy_backend.order_service.service.ProductServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@RequiredArgsConstructor
@Component
@Slf4j
public class PaymentConsumer {
    private final ObjectMapper objectMapper;
    private final OrderService orderService;
    private final ProductServiceClient productServiceClient;
    private final OrderDetailRepository orderDetailRepository;
    private final OrderRepository orderRepository;
    private final OutboxService outboxService;
    
    @Value("${spring.application.name}")
    private String appName;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.payment-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumePaymentEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<PaymentEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            PaymentEvent paymentEvent = event.getData();

            Order order = orderRepository.findById(paymentEvent.getOrderId())
                    .orElseThrow(() -> new RuntimeException(
                            "Order not found for orderId: " + paymentEvent.getOrderId())
                    );
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.PAYMENT_COMPLETED.getName())) {
                orderService.changePaymentStatus(paymentEvent.getOrderId(), paymentEvent.getPaymentStatus());
                log.info("Received PAYMENT_COMPLETED event for orderId: {}", paymentEvent.getOrderId());
            }

            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.PAYMENT_FAILED.getName())) {
                orderService.changePaymentStatus(paymentEvent.getOrderId(), paymentEvent.getPaymentStatus());

                List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                        .orElseThrow(() -> new RuntimeException(
                                "Order details not found for orderId: " + paymentEvent.getOrderId())
                        );
//
//                List<ReserveRequest> reserveRequests = orderDetails.stream()
//                        .map(od -> ReserveRequest.builder()
//                                .productId(od.getProduct().getId())
//                                .quantity(od.getQuantity())
//                                .build())
//                        .toList();
//
//
//                productServiceClient.releaseProduct(reserveRequests);

                OrderEvent orderEvent = OrderEvent.builder()
                        .orderId(order.getId())
                        .customerName(order.getCustomerName())
                        .customerPhoneNumber(order.getCustomerPhoneNumber())
                        .customerAddress(order.getCustomerAddress())
                        .totalPrice(order.getTotalPrice())
                        .createdAt(order.getCreatedAt())
                        .build();

                List<OrderDetailEvent> orderDetailEvents = OrderService.mapToOrderDetailEvents(orderDetails);

                orderEvent.setOrderDetailEventList(orderDetailEvents);

                Event<OrderEvent> eventFailed = Event.<OrderEvent>builder()
                        .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                        .eventType(EventTypeEnum.ORDER_CANCELLED.getName())
                        .data(orderEvent)
                        .source(appName)
                        .build();

                outboxService.handleSaveEvent(eventFailed);


                log.info("Received PAYMENT_COMPLETED event for orderId: {}", paymentEvent.getOrderId());
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
