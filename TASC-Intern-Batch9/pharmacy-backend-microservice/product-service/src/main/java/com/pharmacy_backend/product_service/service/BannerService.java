package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.BannerRequest;
import com.pharmacy_backend.product_service.dto.response.BannerResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface BannerService {
    ApiResponse<List<BannerResponse>> getAllActiveBanners();
    ApiResponse<List<BannerResponse>> getAllBannersForAdmin(Boolean isActive);
    ApiResponse<BannerResponse> getBannerById(Long id);
    ApiResponse<BannerResponse> createBanner(BannerRequest request, MultipartFile image);
    ApiResponse<BannerResponse> updateBanner(Long id, BannerRequest request, MultipartFile image);
    ApiResponse<Void> deleteBanner(Long id);
}
