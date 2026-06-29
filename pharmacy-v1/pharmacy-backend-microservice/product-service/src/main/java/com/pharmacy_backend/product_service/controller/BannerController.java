package com.pharmacy_backend.product_service.controller;


import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.BannerRequest;
import com.pharmacy_backend.product_service.dto.response.BannerResponse;
import com.pharmacy_backend.product_service.entity.Banner;
import com.pharmacy_backend.product_service.service.BannerService;
import feign.Response;
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
@RequestMapping("/banners")
public class BannerController {
    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getPublicBanners() {
        ApiResponse<List<BannerResponse>> response = bannerService.getAllActiveBanners();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("all/admin")
    public ResponseEntity<ApiResponse<List<BannerResponse>>> getAllBannersForAdmin(
            @RequestParam(required = false) Boolean isActive) {
        ApiResponse<List<BannerResponse>> response = bannerService.getAllBannersForAdmin(isActive);
        return ResponseEntity.status(response.getStatus()).body(response);
    }


    @GetMapping("{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> getBannerById(@PathVariable Long id) {
        ApiResponse<BannerResponse> response = bannerService.getBannerById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<BannerResponse>> createBanner(@RequestPart("banner") @Valid BannerRequest request,
                                                                    @RequestPart("image") MultipartFile image) {
        ApiResponse<BannerResponse> response = bannerService.createBanner(request, image);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("{id}")
    public ResponseEntity<ApiResponse<BannerResponse>> updateBanner(@PathVariable Long id,
                                                                    @RequestPart("banner") @Valid BannerRequest request,
                                                                    @RequestPart(value = "image", required = false) MultipartFile image) {
        ApiResponse<BannerResponse> response = bannerService.updateBanner(id, request, image);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBanner(@PathVariable Long id) {
        ApiResponse<Void> response = bannerService.deleteBanner(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
