package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.config.AppConfig;
import com.pharmacy_backend.product_service.dto.request.BannerRequest;
import com.pharmacy_backend.product_service.dto.response.BannerResponse;
import com.pharmacy_backend.product_service.entity.Banner;
import com.pharmacy_backend.product_service.mapper.BannerMapper;
import com.pharmacy_backend.product_service.repository.BannerRepository;
import com.pharmacy_backend.product_service.service.BannerService;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BannerServiceImpl implements BannerService {
    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final FileServiceClient fileServiceClient;

    @Override
    public ApiResponse<List<BannerResponse>> getAllActiveBanners() {
        List<Banner> banners = bannerRepository.findByIsActiveOrderByPriorityAsc(true);
        List<BannerResponse> responses = banners.stream().map(banner -> {
            BannerResponse response = bannerMapper.toBannerResponse(banner);
            response.setImageUrl(AppConfig.getImagePrefix() + banner.getImageUrl());
            return response;
        }).toList();
        return ApiResponse.buildOkResponse(responses, "Lấy danh sách banner active thành công");
    }

    @Override
    public ApiResponse<List<BannerResponse>> getAllBannersForAdmin(Boolean isActive) {
        List<Banner> banners;
        if(isActive == null) {
            banners = bannerRepository.findAll();
        } else {
            banners = bannerRepository.findByIsActive(isActive);
        }
        List<BannerResponse> responses = banners.stream().map(banner -> {
            BannerResponse response = bannerMapper.toBannerResponse(banner);
            response.setType(banner.getType().toString());
            response.setImageUrl(AppConfig.getImagePrefix() + banner.getImageUrl());
            return response;
        }).toList();
        return ApiResponse.buildOkResponse(responses, "Lấy danh sách banner cho admin thành công");
    }

    @Override
    public ApiResponse<BannerResponse> getBannerById(Long id) {
        Banner banner = bannerRepository.findById(id).orElseThrow(
                () -> new CustomException(ErrorCode.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND));
        BannerResponse response = bannerMapper.toBannerResponse(banner);
        response.setImageUrl(AppConfig.getImagePrefix() + banner.getImageUrl());
        return ApiResponse.buildOkResponse(response, "Lấy banner thành công");
    }

    @Override
    public ApiResponse<BannerResponse> createBanner(BannerRequest request, MultipartFile image) {
        Banner banner = bannerMapper.toBanner(request);
        ApiResponse<FileMetadataResponse> uploadResponse = fileServiceClient.uploadFile(
                image, FileCategoryEnum.BANNER.getSubDirectory());
        banner.setImageUrl(uploadResponse.getData().getPath());
        banner.setImageUUID(uploadResponse.getData().getId().toString());
        bannerRepository.save(banner);
        return ApiResponse.buildCreatedResponse(null, "Tạo banner thành công");
    }

    @Override
    public ApiResponse<BannerResponse> updateBanner(Long id, BannerRequest request, MultipartFile image) {
        Banner banner = bannerRepository.findById(id).orElseThrow(
                () -> new CustomException(ErrorCode.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND));
        bannerMapper.toBannerUpdateFromRequest(request, banner);
        if(image != null) {
            fileServiceClient.deleteFile(banner.getImageUUID());
            ApiResponse<FileMetadataResponse> uploadResponse = fileServiceClient.uploadFile(
                    image, FileCategoryEnum.BANNER.getSubDirectory());
            banner.setImageUrl(uploadResponse.getData().getPath());
            banner.setImageUUID(uploadResponse.getData().getId().toString());
        }
        bannerRepository.save(banner);
        return ApiResponse.buildOkResponse(null, "Cập nhật banner thành công");
    }

    @Override
    public ApiResponse<Void> deleteBanner(Long id) {
        Banner banner = bannerRepository.findById(id).orElseThrow(
                () -> new CustomException(ErrorCode.BANNER_NOT_FOUND, HttpStatus.NOT_FOUND));
        fileServiceClient.deleteFile(banner.getImageUUID());
        bannerRepository.delete(banner);
        return ApiResponse.buildOkResponse(null, "Xóa banner thành công");
    }
}
