package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ProductCheckResponse;
import com.pharmacy_backend.common.dto.response.ProductItemError;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.Stock;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.repository.StockRepository;
import com.pharmacy_backend.product_service.service.StockService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StockServiceImpl implements StockService {
    private final StockRepository stockRepository;
    private final ProductRepository productRepository;

    @Override
    public ApiResponse<ReserveResponse> reserveProduct(List<ReserveRequest> reserveRequestList) {
        List<ProductItemError> errors = new ArrayList<>();
        List<ProductCheckResponse> productCheckResponses = new ArrayList<>();

        for (ReserveRequest reserveRequest : reserveRequestList) {
            Product product = productRepository.findById(reserveRequest.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            if(!product.getActive()) {
                ProductItemError productItemError = ProductItemError.builder()
                        .productId(product.getId())
                        .productName(product.getTitle())
                        .errorCode(ErrorCode.PRODUCT_INACTIVE.getName())
                        .message(ErrorCode.PRODUCT_INACTIVE.getMessage())
                        .build();
                errors.add(productItemError);
                continue;
            }

            if (product.getQuantity() < reserveRequest.getQuantity()) {
                ProductItemError productItemError = ProductItemError.builder()
                        .productId(product.getId())
                        .productName(product.getTitle())
                        .errorCode(ErrorCode.INSUFFICIENT_PRODUCT_QUANTITY.getName())
                        .message(ErrorCode.INSUFFICIENT_PRODUCT_QUANTITY.getMessage())
                        .build();
                errors.add(productItemError);
                continue;
            }

            product.setQuantity(product.getQuantity() - reserveRequest.getQuantity());
            stock.increaseReservedStock(Long.valueOf(reserveRequest.getQuantity()));

            productRepository.updateProduct(product.getId() , product);
            stockRepository.save(stock);

            ProductCheckResponse productCheckResponse = ProductCheckResponse.builder()
                    .productId(product.getId())
                    .requestedQuantity(reserveRequest.getQuantity())
                    .priceNew(product.getPriceNew())
                    .build();
            productCheckResponses.add(productCheckResponse);
        }


        if(!errors.isEmpty()) {
            throw new CustomException(ErrorCode.PRODUCT_RESERVATION_FAILED, errors
                    , "Lỗi khi đặt chỗ sản phẩm, một số sản phẩm không đủ điều kiện đặt chỗ");
        }

        ReserveResponse reserveResponse = ReserveResponse.builder()
                .success(true)
                .errors(errors)
                .productCheckResponses(productCheckResponses)
                .build();

        return ApiResponse.buildCreatedResponse(reserveResponse, "Đã đặt chỗ sản phẩm");
    }

    @Override
    public void releaseReserve(List<ReserveRequest> reserveRequestList) {
        List<Stock> stocks = new ArrayList<>();
        for (ReserveRequest reserveRequest : reserveRequestList) {
            Product product = productRepository.findById(reserveRequest.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            stock.decreaseReservedStock(Long.valueOf(reserveRequest.getQuantity()));
            stocks.add(stock);
        }

        stockRepository.saveAll(stocks);
    }

    @Override
    public ApiResponse<Void> releaseStock(List<ReserveRequest> reserveRequestList) {
        List<Stock> stocks = new ArrayList<>();
        for (ReserveRequest reserveRequest : reserveRequestList) {
            Product product = productRepository.findById(reserveRequest.getProductId())
                    .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

            Stock stock = stockRepository.findByProduct(product)
                    .orElseThrow(() -> new CustomException(ErrorCode.STOCK_NOT_FOUND));

            stock.decreaseReservedStock(Long.valueOf(reserveRequest.getQuantity()));
            product.setQuantity(product.getQuantity() + reserveRequest.getQuantity());

            productRepository.updateProduct(product.getId(), product);
            stocks.add(stock);
        }
        

        stockRepository.saveAll(stocks);

        return ApiResponse.buildOkResponse(null, "Đã giải phóng kho hàng");
    }

}
