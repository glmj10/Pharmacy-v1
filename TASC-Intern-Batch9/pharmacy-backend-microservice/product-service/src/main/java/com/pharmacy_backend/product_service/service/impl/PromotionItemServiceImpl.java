package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.request.FlashSaleItemRequest;
import com.pharmacy_backend.product_service.dto.response.FlashSaleItemResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.mapper.PromotionItemMapper;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.repository.PromotionEventRepository;
import com.pharmacy_backend.product_service.repository.PromotionItemRepository;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.PromotionItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PromotionItemServiceImpl implements PromotionItemService {
    private final PromotionItemRepository promotionItemRepository;
    private final PromotionItemMapper promotionItemMapper;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final PromotionEventRepository promotionEventRepository;

    @Override
    public ApiResponse<PageResponse<List<FlashSaleItemResponse>>> getFlashSaleItemByEventId(Long eventId, Integer pageIndex, Integer pageSize) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PromotionItem> flashSaleItems = promotionItemRepository.findByFlashSaleEventId(eventId, pageable);
        List<FlashSaleItemResponse> flashSaleItemResponses = flashSaleItems.getContent().stream()
                .map(item -> {
                    FlashSaleItemResponse response = promotionItemMapper.toFlashSaleItemResponse(item);
                    Product product = productRepository.findById(item.getProductId()).orElse(null);
                    if (product != null) {
                        ProductResponse productResponse = productMapper.toProductResponse(product);
                        response.setProductResponse(productResponse);
                    }
                    return response;
                })
                .toList();

        PageResponse<List<FlashSaleItemResponse>> pageResponse = PageResponse.<List<FlashSaleItemResponse>>builder()
                .content(flashSaleItemResponses)
                .currentPage(pageIndex)
                .totalPages(pageSize)
                .totalElements(flashSaleItems.getTotalElements())
                .totalPages(flashSaleItems.getTotalPages())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sản phẩm trong sự kiện " +
                "flash sale thành công");
    }

    @Override
    public ApiResponse<Void> createFlashSaleItems(FlashSaleItemRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        if(product.getQuantity() == 0) {
            throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        if(request.getSaleStock() > product.getQuantity()) {
            throw new CustomException(ErrorCode.INVALID_SALE_STOCK);
        }

        if(request.getSalePrice() >= product.getPriceNew()) {
            throw new CustomException(ErrorCode.INVALID_FLASH_SALE_PRICE);
        }

        product.setQuantity(product.getQuantity() - request.getSaleStock());
        productRepository.updateProduct(product.getId(), product);

        promotionEventRepository.findById(request.getFlashSaleEventId())
                .orElseThrow(() -> new CustomException(ErrorCode.FLASH_SALE_EVENT_NOT_FOUND));
        if(promotionItemRepository.existsByProductId(request.getProductId())) {
            throw new CustomException(ErrorCode.FLASH_SALE_ITEM_ALREADY_EXISTS);
        }

        PromotionItem promotionItem = promotionItemMapper.toFlashSaleItem(request);
        promotionItemRepository.save(promotionItem);

        return ApiResponse.buildCreatedResponse(null, "Thêm sản phẩm vào sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<Void> removeFlashSaleItems(Long flashSaleItemId) {
        PromotionItem promotionItem = promotionItemRepository.findById(flashSaleItemId)
                .orElseThrow(() -> new CustomException(ErrorCode.FLASH_SALE_EVENT_NOT_FOUND));

        Product product = productRepository.findById(promotionItem.getProductId()).orElse(null);

        if(product != null) {
            product.setQuantity(product.getQuantity() + promotionItem.getSaleStock());
            productRepository.updateProduct(product.getId(), product);
        }

        promotionItemRepository.delete(promotionItem);
        return ApiResponse.buildOkResponse(null, "Xóa sản phẩm khỏi sự kiện flash sale thành công");
    }
}
