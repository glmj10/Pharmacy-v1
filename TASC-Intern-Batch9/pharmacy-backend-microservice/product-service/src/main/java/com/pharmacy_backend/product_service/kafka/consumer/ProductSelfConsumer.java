package com.pharmacy_backend.product_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.StockCacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Slf4j
@RequiredArgsConstructor
public class ProductSelfConsumer {

    private final ProductRepository productRepository;
    private final StockCacheService stockCacheService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
            topics = "${spring.kafka.consumer.topic.product-topic}",
            groupId = "${spring.kafka.consumer.group-id}-self",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeProductEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<ProductEvent> event = objectMapper.readValue(message, new TypeReference<>() {});
            String eventType = event.getEventType();
            ProductEvent productEvent = objectMapper.convertValue(event.getData(), ProductEvent.class);

            if (EventTypeEnum.PRODUCT_OUT_OF_STOCK.getName().equalsIgnoreCase(eventType)) {
                handleOutOfStock(productEvent);
            } else if (EventTypeEnum.PRODUCT_INACTIVE.getName().equalsIgnoreCase(eventType)) {
                handleProductInactive(productEvent);
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            log.error("[ProductSelfConsumer] Không thể parse event: {}", e.getMessage());
            // Không ack → Kafka sẽ retry
            throw new RuntimeException(e);
        }
    }

    private void handleOutOfStock(ProductEvent productEvent) {
        Long productId = productEvent.getProductId();
        log.info("[ProductSelfConsumer] PRODUCT_OUT_OF_STOCK: đánh dấu sản phẩm {} inactive trong DB", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getQuantity() != null && product.getQuantity() == 0 && Boolean.TRUE.equals(product.getActive())) {
            product.setActive(false);
            productRepository.updateProduct(productId, product);
            log.info("[ProductSelfConsumer] Sản phẩm {} đã được đánh dấu inactive trong DB", productId);
        }

        stockCacheService.setStock(productId, 0);
    }

    private void handleProductInactive(ProductEvent productEvent) {
        log.info("[ProductSelfConsumer] PRODUCT_INACTIVE: sản phẩm {} đã inactive trong DB", productEvent.getProductId());
    }
}
