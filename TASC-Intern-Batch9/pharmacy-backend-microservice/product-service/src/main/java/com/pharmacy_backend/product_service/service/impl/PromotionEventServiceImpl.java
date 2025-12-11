package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.request.FlashSaleEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import com.pharmacy_backend.product_service.mapper.PromotionEventMapper;
import com.pharmacy_backend.product_service.repository.PromotionEventRepository;
import com.pharmacy_backend.product_service.service.PromotionEventService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional
public class PromotionEventServiceImpl implements PromotionEventService {

    private final PromotionEventRepository promotionEventRepository;
    private final PromotionEventMapper promotionEventMapper;

    @Override
    public ApiResponse<List<PromotionEventResponse>> getCurrentEvent() {
        List<PromotionEvent> currentEvents = promotionEventRepository.findCurrentFlashSaleEvents();

        List<PromotionEventResponse> responses = currentEvents.stream()
                .map(promotionEventMapper::toResponse)
                .toList();
        return ApiResponse.buildOkResponse(responses, "Lấy danh sách sự kiện flash sale hiện tại thành công");
    }

    @Override
    public ApiResponse<PageResponse<List<PromotionEventResponse>>> getAllEvents(Integer pageIndex, Integer pageSize) {
        if(pageIndex == null || pageIndex < 1) {
            pageIndex = 1;
        }

        if(pageSize == null || pageSize < 1) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PromotionEvent> flashSaleEventPage = promotionEventRepository.findAll(pageable);

        List<PromotionEventResponse> promotionEventResponseList = flashSaleEventPage.getContent().stream()
                .map(promotionEventMapper::toResponse)
                .toList();

        PageResponse<List<PromotionEventResponse>> pageResponse = PageResponse.<List<PromotionEventResponse>>builder()
                .content(promotionEventResponseList)
                .currentPage(pageIndex)
                .totalElements(flashSaleEventPage.getTotalElements())
                .totalPages(flashSaleEventPage.getTotalPages())
                .hasNext(flashSaleEventPage.hasNext())
                .hasPrevious(flashSaleEventPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<PromotionEventResponse> getEventById(Long eventId) {
        PromotionEvent promotionEvent = promotionEventRepository.findById(eventId).orElseThrow(() ->
                new CustomException(ErrorCode.FLASH_SALE_EVENT_NOT_FOUND)
        );

        PromotionEventResponse response = promotionEventMapper.toResponse(promotionEvent);
        return ApiResponse.buildOkResponse(response, "Lấy thông tin sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<Void> createEvent(FlashSaleEventRequest request, MultipartFile thumbnail) {
        PromotionEvent promotionEvent = promotionEventMapper.toFlashSaleEvent(request);
        promotionEventRepository.save(promotionEvent);

        return ApiResponse.buildOkResponse(null, "Tạo sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<Void> updateEvent(Long eventId, FlashSaleEventRequest request) {
        PromotionEvent existingEvent = promotionEventRepository.findById(eventId).orElseThrow(() ->
                new CustomException(ErrorCode.FLASH_SALE_EVENT_NOT_FOUND)
        );

        PromotionEvent event = promotionEventMapper.toFlashSaleEventUpdateFromRequest(request, existingEvent);
        promotionEventRepository.save(event);
        return ApiResponse.buildOkResponse(null, "Cập nhật sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<Void> deleteEvent(Long eventId) {
        PromotionEvent existingEvent = promotionEventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException(ErrorCode.FLASH_SALE_EVENT_NOT_FOUND)
        );

        promotionEventRepository.delete(existingEvent);
        return ApiResponse.buildOkResponse(null, "Xóa sự kiện flash sale thành công");
    }
}
