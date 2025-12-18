package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.AllPromotionItemRequest;
import com.pharmacy_backend.product_service.dto.request.PromotionItemRequest;
import com.pharmacy_backend.product_service.dto.response.AllPromotionItemResponse;
import com.pharmacy_backend.product_service.dto.response.PromotionItemResponse;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromotionItemMapper {

    PromotionItemResponse toPromotionItemResponse(PromotionItem item);

    PromotionItem toPromotionItem(PromotionItemRequest request);
}
