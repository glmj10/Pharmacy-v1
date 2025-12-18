package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.AllPromotionItemRequest;
import com.pharmacy_backend.product_service.dto.response.AllPromotionItemResponse;
import com.pharmacy_backend.product_service.dto.response.PromotionItemResponse;
import com.pharmacy_backend.product_service.service.PromotionItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/promotion-items")
@RequiredArgsConstructor
@Controller
public class PromotionItemController {
    private final PromotionItemService promotionItemService;

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<PageResponse<List<PromotionItemResponse>>>> getPromotionItemByEventId
            (
                    @PathVariable Long eventId,
                    @RequestParam(defaultValue = "0") Integer pageIndex,
                    @RequestParam(defaultValue = "10") Integer pageSize
            )
    {
        ApiResponse<PageResponse<List<PromotionItemResponse>>> response = promotionItemService
                .getPromotionItemByEventId(eventId, pageIndex, pageSize);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')" )
    @PostMapping
    public ResponseEntity<ApiResponse<AllPromotionItemResponse>> createPromotionItems(@RequestBody @Valid AllPromotionItemRequest request) {
        ApiResponse<AllPromotionItemResponse> response = promotionItemService.createPromotionItems(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> removePromotionItems(@RequestBody List<Long> id) {
        ApiResponse<Void> response = promotionItemService.removePromotionItems(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
