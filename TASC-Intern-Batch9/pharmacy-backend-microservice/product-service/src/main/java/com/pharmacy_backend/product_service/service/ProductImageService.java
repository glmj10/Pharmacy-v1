package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.product_service.dto.response.ProductImageResponse;
import com.pharmacy_backend.product_service.entity.Product;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductImageService {
    List<ProductImageResponse> getProductImagesByProduct(Product product);
    List<ProductImageResponse> createProductImages(Product product, List<MultipartFile> images);
    List<ProductImageResponse> updateProductImages(Product product, List<MultipartFile> images);
    void deleteProductImagesByProduct(Product product);
}
