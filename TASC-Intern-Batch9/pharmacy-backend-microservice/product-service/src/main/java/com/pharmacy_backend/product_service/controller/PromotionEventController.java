package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.PromotionEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import com.pharmacy_backend.product_service.service.PromotionEventService;
import com.pharmacy_backend.common.dto.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/promotions")
public class PromotionEventController {
    private final PromotionEventService promotionEventService;

    @GetMapping("/products/current")
    public ResponseEntity<ApiResponse<List<PromotionEventResponse>>> getCurrentPromotionEvents() {
        ApiResponse<List<PromotionEventResponse>> response = promotionEventService.getCurrentEvent();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<PromotionEventResponse>>>> getAllPromotionEvents
            (
                    @RequestParam(defaultValue = "0") Integer pageIndex,
                    @RequestParam(defaultValue = "10") Integer pageSize
            ) {
        ApiResponse<PageResponse<List<PromotionEventResponse>>> response = promotionEventService.getAllEvents(pageIndex, pageSize);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createPromotionEvent(@RequestPart("promotion") @Valid PromotionEventRequest request, @RequestPart("thumbnail") MultipartFile thumbnail) {
        ApiResponse<Void> response = promotionEventService.createEvent(request, thumbnail);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updatePromotionEvent(@PathVariable Long id,
                                                                  @RequestPart("promotion") @Valid PromotionEventRequest request,
                                                                  @RequestPart MultipartFile thumbnail) {
        ApiResponse<Void> response = promotionEventService.updateEvent(id, request, thumbnail);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotionEvent(@PathVariable Long id) {
        ApiResponse<Void> response = promotionEventService.deleteEvent(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
    
    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> changePromotionEventStatus(@PathVariable Long id,
                                                                        @RequestParam String status) {
        ApiResponse<Void> response = promotionEventService.changePromotionStatus(id, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
