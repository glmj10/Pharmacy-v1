package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.PromotionEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PromotionEventMapper {

    PromotionEvent toPromotionEvent(PromotionEventRequest request);

    PromotionEventResponse toResponse(PromotionEvent promotionEvent);
    PromotionEvent toPromotionEventUpdateFromRequest(PromotionEventRequest request, @MappingTarget PromotionEvent event);

}
