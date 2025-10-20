package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.CategoryRequest;
import com.pharmacy_backend.product_service.dto.response.CategoryParentAndChildResponse;
import com.pharmacy_backend.product_service.dto.response.CategoryResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface CategoryService {
    ApiResponse<List<CategoryResponse>> getAllCategories();
    ApiResponse<List<CategoryParentAndChildResponse>> getAllCategoriesByParentSlug(String parentSlug);
    ApiResponse<CategoryResponse> getCategoryById(Long id);
    ApiResponse<CategoryResponse> createCategory(CategoryRequest request, MultipartFile thumbnail);
    ApiResponse<CategoryResponse> updateCategory(Long id, CategoryRequest request, MultipartFile thumbnail);
    ApiResponse<Void> deleteCategory(Long id);
    ApiResponse<List<CategoryResponse>> getAllProductCategories();
    ApiResponse<List<CategoryResponse>> getAllBlogCategories();
}
