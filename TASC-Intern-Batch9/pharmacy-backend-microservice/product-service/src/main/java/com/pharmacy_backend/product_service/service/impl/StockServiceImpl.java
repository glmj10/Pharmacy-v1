package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ProductCheckResponse;
import com.pharmacy_backend.common.dto.response.ProductItemError;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.enums.PartitionKeyEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.Stock;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.repository.StockRepository;
import com.pharmacy_backend.product_service.service.OutboxService;
import com.pharmacy_backend.product_service.service.StockCacheService;
import com.pharmacy_backend.product_service.service.StockService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImpl implements StockService {

    private final StockRepository stockRepository;
    private final ProductRepository productRepository;
    private final StockCacheService stockCacheService;
    private final OutboxService outboxService;

    @Value("${spring.application.name}")
    private String appName;

    @Override
    public ApiResponse<ReserveResponse> reserveProduct(List<ReserveRequest> reserveRequestList) {
        List<ProductItemError>    errors          = new ArrayList<>();
        List<ProductCheckResponse> results        = new ArrayList<>();
        // Track sản phẩm đã reserve thành công để rollback nếu cần
        List<ReserveRequest>      reservedSoFar  = new ArrayList<>();

        for (ReserveRequest req : reserveRequestList) {
            Long productId = req.getProductId();
            int  qty       = req.getQuantity();

            int redisResult = stockCacheService.reserveStock(productId, qty);

            if (redisResult == 0) {
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
                errors.add(buildError(product, ErrorCode.PRODUCT_OUT_OF_STOCK));
                publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_OUT_OF_STOCK);
                continue;
            }

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            if (redisResult == -1) {
                if (!product.getActive()) {
                    errors.add(buildError(product, ErrorCode.PRODUCT_INACTIVE));
                    publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_INACTIVE);
                    stockCacheService.setStock(productId, product.getQuantity());
                    continue;
                }
                if (product.getQuantity() < qty) {
                    errors.add(buildError(product, ErrorCode.PRODUCT_OUT_OF_STOCK));
                    publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_OUT_OF_STOCK);
                    stockCacheService.setStock(productId, product.getQuantity());
                    continue;
                }
                stockCacheService.setStock(productId, product.getQuantity() - qty);
            }

            int newQuantity = product.getQuantity() - qty;
            product.setQuantity(newQuantity);
            stock.increaseReservedStock((long) qty);
            productRepository.updateProduct(productId, product);
            stockRepository.save(stock);

            if (newQuantity == 0) {
                log.info("Sản phẩm {} hết hàng, publish outbox event để đánh dấu inactive", productId);
                stockCacheService.setStock(productId, 0);
                publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_OUT_OF_STOCK);
                publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_INACTIVE);
            }

            publishStockReservedOutboxEvent(productId, qty);

            reservedSoFar.add(req);
            results.add(ProductCheckResponse.builder()
                    .productId(productId)
                    .requestedQuantity(qty)
                    .priceNew(product.getPriceNew())
                    .build());
        }

        if (!errors.isEmpty()) {
            if (!reservedSoFar.isEmpty()) {
                releaseReserve(reservedSoFar);
            }
            return ApiResponse.buildOkResponse(
                    ReserveResponse.builder()
                            .success(false)
                            .errors(errors)
                            .productCheckResponses(List.of())
                            .build(),
                    "Lỗi khi đặt chỗ sản phẩm, một số sản phẩm không đủ điều kiện đặt chỗ"
            );
        }

        return ApiResponse.buildCreatedResponse(
                ReserveResponse.builder()
                        .success(true)
                        .errors(List.of())
                        .productCheckResponses(results)
                        .build(),
                "Đã đặt chỗ sản phẩm"
        );
    }

    @Override
    public void releaseReserve(List<ReserveRequest> reserveRequestList) {
        List<Stock> stocks = new ArrayList<>();
        for (ReserveRequest req : reserveRequestList) {
            Long productId = req.getProductId();
            int  qty       = req.getQuantity();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            stock.decreaseReservedStock((long) qty);
            int newQuantity = product.getQuantity() + qty;
            product.setQuantity(newQuantity);

            boolean wasInactive = !product.getActive();
            if (wasInactive && newQuantity > 0) {
                product.setActive(true);
                log.info("Sản phẩm {} có hàng trở lại sau khi hủy đơn, đánh dấu active", productId);
            }

            productRepository.updateProduct(productId, product);
            stocks.add(stock);

            int redisResult = stockCacheService.releaseStock(productId, qty);
            if (redisResult == -1) {
                stockCacheService.setStock(productId, newQuantity);
            }

            publishStockReleasedOutboxEvent(productId, qty);

            if (wasInactive && product.getActive()) {
                publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_UPDATED);
            }
        }
        stockRepository.saveAll(stocks);
    }


    @Override
    public ApiResponse<Void> releaseStock(List<ReserveRequest> reserveRequestList) {
        List<Stock> stocks = new ArrayList<>();
        for (ReserveRequest req : reserveRequestList) {
            Long productId = req.getProductId();
            int  qty       = req.getQuantity();

            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            stock.decreaseReservedStock((long) qty);
            int newQuantity = product.getQuantity() + qty;
            product.setQuantity(newQuantity);

            boolean wasInactive = !product.getActive();
            if (wasInactive && newQuantity > 0) {
                product.setActive(true);
                log.info("Sản phẩm {} có hàng trở lại sau khi giải phóng kho, đánh dấu active", productId);
            }

            productRepository.updateProduct(productId, product);
            stocks.add(stock);

            int redisResult = stockCacheService.releaseStock(productId, qty);
            if (redisResult == -1) {
                stockCacheService.setStock(productId, newQuantity);
            }

            publishStockReleasedOutboxEvent(productId, qty);

            if (wasInactive && product.getActive()) {
                publishProductOutboxEvent(product, EventTypeEnum.PRODUCT_UPDATED);
            }
        }
        stockRepository.saveAll(stocks);
        return ApiResponse.buildOkResponse(null, "Đã giải phóng kho hàng");
    }

    private void publishProductOutboxEvent(Product product, EventTypeEnum eventType) {
        ProductEvent payload = ProductEvent.builder()
                .productId(product.getId())
                .title(product.getTitle())
                .priceOld(product.getPriceOld())
                .priceNew(product.getPriceNew())
                .slug(product.getSlug())
                .active(product.getActive())
                .quantity(product.getQuantity())
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .eventType(eventType.getName())
                .source(appName)
                .key(String.valueOf(product.getId()))
                .data(payload)
                .build();

        outboxService.handleSaveEvent(event, TopicEnum.PRODUCT_TOPIC, PartitionKeyEnum.PRODUCT);
    }


    private void publishStockReservedOutboxEvent(Long productId, int qty) {
        ProductEvent payload = ProductEvent.builder()
                .productId(productId)
                .quantity(qty)
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .eventType(EventTypeEnum.PRODUCT_STOCK_RESERVED.getName())
                .source(appName)
                .key(String.valueOf(productId))
                .data(payload)
                .build();

        outboxService.handleSaveEvent(event, TopicEnum.PRODUCT_TOPIC, PartitionKeyEnum.PRODUCT);
    }

    private void publishStockReleasedOutboxEvent(Long productId, int qty) {
        ProductEvent payload = ProductEvent.builder()
                .productId(productId)
                .quantity(qty)
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .eventType(EventTypeEnum.PRODUCT_STOCK_RELEASED.getName())
                .source(appName)
                .key(String.valueOf(productId))
                .data(payload)
                .build();

        outboxService.handleSaveEvent(event, TopicEnum.PRODUCT_TOPIC, PartitionKeyEnum.PRODUCT);
    }

    private ProductItemError buildError(Product product, ErrorCode errorCode) {
        return ProductItemError.builder()
                .productId(product.getId())
                .productName(product.getTitle())
                .errorCode(errorCode.getName())
                .message(errorCode.getMessage())
                .build();
    }
}
