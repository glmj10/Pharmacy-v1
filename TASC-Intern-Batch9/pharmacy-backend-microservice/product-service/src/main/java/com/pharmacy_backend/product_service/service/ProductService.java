package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.request.ProductNeedToCheckStockRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.dto.response.ProductCheckResponse;
import com.pharmacy_backend.product_service.dto.request.ProductCMSFilterRequest;
import com.pharmacy_backend.product_service.dto.request.ProductFilterCustomerRequest;
import com.pharmacy_backend.product_service.dto.request.ProductRequest;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

public interface ProductService {
    ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex,
                                                                      int pageSize,
                                                                      ProductCMSFilterRequest filterRequest);
    ApiResponse<PageResponse<List<ProductResponse>>> getAllActiveProduct(int pageIndex,
                                                                         int pageSize,
                                                                         ProductFilterCustomerRequest filterRequest);
    ApiResponse<ProductResponse> getProductById(Long id);
    ApiResponse<ProductResponse> getProductBySlug(String slug);
    ApiResponse<ProductResponse> createProduct(ProductRequest request,
                                               MultipartFile thumbnail,
                                               List<MultipartFile> images);
    ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request,
                                               MultipartFile thumbnail, List<MultipartFile> images);
    ApiResponse<ProductResponse> changeProductStatus(Long id, Boolean active);
    ApiResponse<Void> deleteProduct(Long id);

    ApiResponse<Long> getTotalProduct();
    ApiResponse<List<ProductResponse>> getTop15ProductsByNumberOfLikes();
    ApiResponse<List<ProductResponse>> get15ProductByBrand(Long brandId);
}
