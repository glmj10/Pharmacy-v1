package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.AllPromotionItemRequest;
import com.pharmacy_backend.product_service.dto.request.PromotionItemRequest;
import com.pharmacy_backend.product_service.dto.response.AllPromotionItemResponse;
import com.pharmacy_backend.product_service.dto.response.PromotionItemResponse;

import java.util.List;

public interface PromotionItemService {

    ApiResponse<PageResponse<List<PromotionItemResponse>>> getPromotionItemByEventId(Long eventId,
                                                                                     Integer pageIndex,
                                                                                     Integer pageSize);

    ApiResponse<AllPromotionItemResponse> createPromotionItems(AllPromotionItemRequest request);
    ApiResponse<Void> removePromotionItems(List<Long> ids);
    ApiResponse<Void> updatePromotionItems(Long promotionItemId, PromotionItemRequest request);
}
