package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.FlashSaleItemRequest;
import com.pharmacy_backend.product_service.dto.response.FlashSaleItemResponse;

import java.util.List;

public interface PromotionItemService {

    ApiResponse<PageResponse<List<FlashSaleItemResponse>>> getFlashSaleItemByEventId(Long eventId,
                                                                                     Integer pageIndex,
                                                                                     Integer pageSize);

    ApiResponse<Void> createFlashSaleItems(FlashSaleItemRequest request);
    ApiResponse<Void> removeFlashSaleItems(Long flashSaleItemId);
}
