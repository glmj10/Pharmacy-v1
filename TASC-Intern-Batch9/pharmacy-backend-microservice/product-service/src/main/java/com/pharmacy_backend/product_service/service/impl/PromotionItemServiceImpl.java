package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.request.AllPromotionItemRequest;
import com.pharmacy_backend.product_service.dto.request.PromotionItemRequest;
import com.pharmacy_backend.product_service.dto.response.AllPromotionItemResponse;
import com.pharmacy_backend.product_service.dto.response.PromotionItemResponse;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.mapper.PromotionItemMapper;
import com.pharmacy_backend.product_service.repository.PromotionEventRepository;
import com.pharmacy_backend.product_service.repository.PromotionItemRepository;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.PromotionItemService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionItemServiceImpl implements PromotionItemService {
    private final PromotionItemRepository promotionItemRepository;
    private final PromotionItemMapper promotionItemMapper;
    private final ProductRepository productRepository;
    private final PromotionEventRepository promotionEventRepository;
    private final ProductMapper productMapper;

    @Override
    public ApiResponse<PageResponse<List<PromotionItemResponse>>> getPromotionItemByEventId(Long eventId, Integer pageIndex, Integer pageSize) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PromotionItem> promotionItems = promotionItemRepository.findByPromotionEventId(eventId, pageable);
        List<PromotionItemResponse> promotionItemResponses = promotionItems.getContent().stream()
                .map(item -> {
                    PromotionItemResponse response = promotionItemMapper.toPromotionItemResponse(item);
                    productRepository.findById(item.getProductId()).ifPresent(product ->
                            response.setProduct(productMapper.toProductResponse(product)));
                    return response;
                })
                .toList();

        PageResponse<List<PromotionItemResponse>> pageResponse = PageResponse.<List<PromotionItemResponse>>builder()
                .content(promotionItemResponses)
                .currentPage(pageIndex)
                .totalPages(pageSize)
                .totalElements(promotionItems.getTotalElements())
                .totalPages(promotionItems.getTotalPages())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sản phẩm trong sự kiện " +
                "thành công");
    }

    @Transactional
    @Override
    public ApiResponse<AllPromotionItemResponse> createPromotionItems(AllPromotionItemRequest request) {
        PromotionEvent promotionEvent = promotionEventRepository.findById(request.getPromotionEventId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROMOTION_EVENT_NOT_FOUND));

        List<Long> productIds = request.getPromotionItemRequests().stream()
                .map(PromotionItemRequest::getProductId)
                .toList();

        Map<Long, Product> productMap =
                productRepository.findAllByIds(productIds)
                        .stream()
                        .collect(Collectors.toMap(Product::getId, Function.identity()));

        Set<Long> existingInSameEventProductIds = promotionItemRepository
                .findAllExistInEvent(request.getPromotionEventId(), productIds)
                .stream()
                .map(PromotionItem::getProductId)
                .collect(Collectors.toSet());

        Set<Long> existInOtherEventProductIds = promotionItemRepository
                .findAllByPromotionIdDifferentEvent(request.getPromotionEventId(), productIds)
                .stream()
                .map(PromotionItem::getProductId)
                .collect(Collectors.toSet());

        List<PromotionItem> validItems = new ArrayList<>();
        List<PromotionItemResponse> failedItems = new ArrayList<>();

        for (PromotionItemRequest item : request.getPromotionItemRequests()) {

            Long productId = item.getProductId();

            Product product = productMap.get(productId);
            if (product == null) {
                failedItems.add(fail(item, ErrorCode.PRODUCT_NOT_FOUND));
                continue;
            }

            if (existingInSameEventProductIds.contains(productId)) {
                failedItems.add(fail(item, ErrorCode.PROMOTION_ITEM_ALREADY_EXISTS));
                continue;
            }

            if (existInOtherEventProductIds.contains(productId)) {
                failedItems.add(fail(item, ErrorCode.PROMOTION_ITEM_ALREADY_EXISTS_IN_DIFFERENT_EVENT));
                continue;
            }

            if (isValidPrice(item, product)) {
                failedItems.add(fail(item, ErrorCode.PROMOTION_ITEM_INVALID_SALE_PRICE));
                continue;
            }

            PromotionItem entity = promotionItemMapper.toPromotionItem(item);
            entity.setPromotionEventId(promotionEvent.getId());
            validItems.add(entity);
        }


        promotionItemRepository.saveAll(validItems);
        AllPromotionItemResponse response = AllPromotionItemResponse.builder()
                .successCount(validItems.size())
                .failedItems(failedItems)
                .totalRequested((long) request.getPromotionItemRequests().size())
                .successItems(validItems.stream()
                        .map(promotionItemMapper::toPromotionItemResponse)
                        .collect(Collectors.toList()))
                .promotionEventId(promotionEvent.getId())
                .build();

        return ApiResponse.buildCreatedResponse(response, "Thêm sản phẩm vào sự kiện thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> removePromotionItems(List<Long> promotionItemIds) {
        List<PromotionItem> promotionItems = promotionItemRepository.findAllById(promotionItemIds);
        promotionItemRepository.deleteAll(promotionItems);
        return ApiResponse.buildOkResponse(null, "Xóa sản phẩm khỏi sự kiện thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> updatePromotionItems(Long promotionItemId, PromotionItemRequest request) {
        PromotionItem promotionItem = promotionItemRepository.findById(promotionItemId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROMOTION_ITEM_NOT_FOUND));

        PromotionEvent promotionEvent = promotionEventRepository.findById(promotionItem.getPromotionEventId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROMOTION_EVENT_NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        if(promotionEvent.getStatus() != null &&
                promotionEvent.getStatus() == PromotionEventStatusEnum.ONGOING) {
            throw new CustomException(ErrorCode.PROMOTION_EVENT_ACTIVE_CANNOT_UPDATE_ITEM);
        }

        if (isValidPrice(request, product)) {
            throw new CustomException(ErrorCode.PROMOTION_ITEM_INVALID_SALE_PRICE);
        }

        promotionItem.setSalePrice(request.getSalePrice());
        promotionItemRepository.save(promotionItem);
        return ApiResponse.buildOkResponse(null, "Cập nhật sản phẩm trong sự kiện thành công");
    }

    private boolean isValidPrice(PromotionItemRequest item, Product product) {

        Integer original = product.getPriceNew();

        if (item.getSalePrice() != null) {
            return item.getSalePrice() <= 0
                    || item.getSalePrice().compareTo(original) >= 0;
        }

        return true;
    }

    private PromotionItemResponse fail(
            PromotionItemRequest item,
            ErrorCode errorCode
    ) {
        PromotionItemResponse response = new PromotionItemResponse();
        response.setProductId(item.getProductId());
        response.setErrorCode(errorCode.getName());
        response.setSalePrice(item.getSalePrice());
        response.setMessage(errorCode.getMessage());
        return response;
    }

}
