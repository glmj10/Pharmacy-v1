package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.FlashSaleEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PromotionEventService {

    ApiResponse<List<PromotionEventResponse>> getCurrentEvent();
    ApiResponse<PageResponse<List<PromotionEventResponse>>> getAllEvents(Integer pageIndex, Integer pageSize);
    ApiResponse<PromotionEventResponse> getEventById(Long eventId);
    ApiResponse<Void> createEvent(FlashSaleEventRequest request, MultipartFile thumbnail);
    ApiResponse<Void> updateEvent(Long eventId, FlashSaleEventRequest request);
    ApiResponse<Void> deleteEvent(Long eventId);
}
