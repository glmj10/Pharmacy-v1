package com.pharmacy_backend.product_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.common.kafka.event.OrderReserveEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.product_service.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
@RequiredArgsConstructor
public class OrderConsumer {
    private final StockService stockService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.order-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeOrderEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.ORDER_RELEASED.getName())) {
                OrderReserveEvent orderReserveEvent = objectMapper.convertValue(event.getData(),
                        OrderReserveEvent.class);
                List<OrderDetailEvent> orderDetailEventList = orderReserveEvent.getOrderDetailEvents();
                List<ReserveRequest> reserveRequestList = orderDetailEventList.stream()
                        .map(orderDetailEvent -> ReserveRequest.builder()
                                .productId(orderDetailEvent.getProductId())
                                .quantity((int) orderDetailEvent.getQuantity())
                                .build())
                        .toList();
                stockService.releaseStock(reserveRequestList);
                log.info("Consume order event: {}", event);
            }

            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.ORDER_CANCELLED.getName())) {
                OrderReserveEvent orderReserveEvent = objectMapper.convertValue(event.getData(),
                        OrderReserveEvent.class);
                List<OrderDetailEvent> orderDetailEventList = orderReserveEvent.getOrderDetailEvents();
                List<ReserveRequest> reserveRequestList = orderDetailEventList.stream()
                        .map(orderDetailEvent -> ReserveRequest.builder()
                                .productId(orderDetailEvent.getProductId())
                                .quantity((int) orderDetailEvent.getQuantity())
                                .build())
                        .toList();
                stockService.releaseStock(reserveRequestList);
                log.info("Consume order event: {}", event);
            }
            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
