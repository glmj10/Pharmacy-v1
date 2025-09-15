package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.ProductCMSFilterRequest;
import com.project.pharmacy.dto.request.ProductFilterCustomerRequest;
import com.project.pharmacy.dto.request.ProductRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

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
