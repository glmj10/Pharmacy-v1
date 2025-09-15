package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.response.BrandResponse;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.BrandMapper;
import com.project.pharmacy.repository.BrandRepository;
import com.project.pharmacy.service.BrandService;
import com.project.pharmacy.dto.request.BrandRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.entity.Brand;
import com.project.pharmacy.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BrandServiceImpl implements BrandService {
    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<BrandResponse>>> getAllBrands(int pageIndex, int pageSize, String name) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Brand> brandPage;
        if(name != null && !name.isEmpty()) {
            brandPage = brandRepository.findByNameContainingIgnoreCase(name, pageable);
        } else {
            brandPage = brandRepository.findAll(pageable);
        }

        List<BrandResponse> brandResponses = brandPage.getContent().stream()
                .map(brandMapper::toBrandResponse)
                .toList();

        PageResponse<List<BrandResponse>> pageResponse = PageResponse.<List<BrandResponse>>builder()
                .content(brandResponses)
                .currentPage(pageIndex)
                .totalElements(brandPage.getTotalElements())
                .totalPages(brandPage.getTotalPages())
                .hasNext(brandPage.hasNext())
                .hasPrevious(brandPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách thương hiệu thành công");
    }

    @Override
    public ApiResponse<List<BrandResponse>> getAllBrands() {
        List<Brand> brands = brandRepository.findAll();
        List<BrandResponse> brandResponses = brands.stream()
                .map(brandMapper::toBrandResponse)
                .toList();

        return ApiResponse.buildOkResponse(brandResponses, "Lấy danh sách thương hiệu thành công");
    }


    @Transactional
    @Override
    public ApiResponse<BrandResponse> getBrandById(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Thương hiệu không tồn tại"));

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.buildOkResponse(brandResponse, "Lấy thương hiệu thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BrandResponse> createBrand(BrandRequest request) {
        Brand brand = brandMapper.toBrand(request);

        brand.setSlug(createSlug(brand.getName()));
        brand = brandRepository.save(brand);

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.buildCreatedResponse(brandResponse, "Tạo thương hiệu thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BrandResponse> updateBrand(Long id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Thương hiệu không tồn tại"));

        Brand updatedBrand = brandMapper.toBrandUpdateFromRequest(request, brand);
        updatedBrand.setSlug(createSlug(updatedBrand.getName()));

        brand = brandRepository.save(brand);

        BrandResponse brandResponse = brandMapper.toBrandResponse(brand);

        return ApiResponse.buildCreatedResponse(brandResponse, "Cập nhật thương hiệu thành công");
    }


    @Transactional
    @Override
    public ApiResponse<Void> deleteBrand(Long id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Thương hiệu không tồn tại"));

        brandRepository.delete(brand);

        return ApiResponse.buildOkResponse(null, "Xóa thương hiệu thành công");
    }

    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(brandRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }
}
