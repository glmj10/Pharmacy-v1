package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.FlashSaleItemRequest;
import com.pharmacy_backend.product_service.dto.response.FlashSaleItemResponse;
import com.pharmacy_backend.product_service.service.PromotionItemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/flash-sale-items")
@RequiredArgsConstructor
@Controller
public class PromotionItemController {
    private final PromotionItemService promotionItemService;

    @GetMapping("/{eventId}")
    public ResponseEntity<ApiResponse<PageResponse<List<FlashSaleItemResponse>>>> getPromotionItemByEventId
            (
                    @PathVariable Long eventId,
                    @RequestParam(defaultValue = "0") Integer pageIndex,
                    @RequestParam(defaultValue = "10") Integer pageSize
            )
    {
        ApiResponse<PageResponse<List<FlashSaleItemResponse>>> response = promotionItemService
                .getFlashSaleItemByEventId(eventId, pageIndex, pageSize);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')" )
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createPromotionItems(@RequestBody @Valid FlashSaleItemRequest request) {
        ApiResponse<Void> response = promotionItemService.createFlashSaleItems(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> removePromotionItems(@PathVariable Long id) {
        ApiResponse<Void> response = promotionItemService.removeFlashSaleItems(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
