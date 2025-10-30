package com.pharmacy_backend.order_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.PaymentEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.OrderDetail;
import com.pharmacy_backend.order_service.repository.OrderDetailRepository;
import com.pharmacy_backend.order_service.repository.OrderRepository;
import com.pharmacy_backend.order_service.service.OrderService;
import com.pharmacy_backend.order_service.service.ProductServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

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

                List<ReserveRequest> reserveRequests = orderDetails.stream()
                        .map(od -> ReserveRequest.builder()
                                .productId(od.getProduct().getId())
                                .quantity(od.getQuantity())
                                .build())
                        .toList();
                productServiceClient.releaseProduct(reserveRequests);
                log.info("Received PAYMENT_COMPLETED event for orderId: {}", paymentEvent.getOrderId());
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
