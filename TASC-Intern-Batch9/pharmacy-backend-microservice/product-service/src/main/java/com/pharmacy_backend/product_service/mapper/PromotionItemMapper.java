package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.FlashSaleItemRequest;
import com.pharmacy_backend.product_service.dto.response.FlashSaleItemResponse;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromotionItemMapper {

    @Mapping(target = "productResponse", ignore = true)
    FlashSaleItemResponse toFlashSaleItemResponse(PromotionItem item);

    PromotionItem toFlashSaleItem(FlashSaleItemRequest request);
}
