package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.product_service.dto.request.PromotionEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PromotionEventService {

    ApiResponse<List<PromotionEventResponse>> getCurrentEvent();
    ApiResponse<PageResponse<List<PromotionEventResponse>>> getAllEvents(Integer pageIndex, Integer pageSize);
    ApiResponse<PromotionEventResponse> getEventById(Long eventId);
    ApiResponse<Void> createEvent(PromotionEventRequest request, MultipartFile thumbnail);
    ApiResponse<Void> updateEvent(Long eventId, PromotionEventRequest request, MultipartFile thumbnail);
    ApiResponse<Void> deleteEvent(Long eventId);
    void activePromotion(Long promotionId);
    ApiResponse<Void> changePromotionStatus(Long promotionId, String status);
}
