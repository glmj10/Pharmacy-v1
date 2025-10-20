package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.response.ProductImageResponse;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.ProductImage;
import com.pharmacy_backend.product_service.mapper.ProductImageMapper;
import com.pharmacy_backend.product_service.repository.ProductImageRepository;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.service.ProductImageService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageServiceImpl implements ProductImageService {
    private final ProductImageRepository productImageRepository;
    private final FileServiceClient fileServiceClient;
    private final ProductImageMapper productImageMapper;

    @Transactional
    @Override
    public List<ProductImageResponse> getProductImagesByProduct(Product product) {
        return productImageRepository.findByProduct(product)
                .stream()
                .map(productImage -> {
                    ProductImageResponse response = productImageMapper.toProductImageResponse(productImage);
                    response.setImageUrl(fileServiceClient.getFilelUrl(productImage.getImageUUID()));

                    return response;
                })
                .toList();
    }

    @Transactional
    @Override
    public List<ProductImageResponse> createProductImages(Product product, List<MultipartFile> images) {
        if(images == null || images.isEmpty()) {
            return List.of();
        }
        return images.stream()
                .map(image -> {
                    ProductImage productImage = new ProductImage();
                    ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(image,
                            FileCategoryEnum.PRODUCT.getSubDirectory());
                    productImage.setProduct(product);
                    productImage.setImageUUID(thumbnailResponse.getData().getId().toString());
                    productImageRepository.save(productImage);
                    return productImageMapper.toProductImageResponse(productImage);
                })
                .toList();
    }

    @Transactional
    @Override
    public List<ProductImageResponse> updateProductImages(Product product, List<MultipartFile> images) {
        if(images == null || images.isEmpty()) {
            return List.of();
        }

        productImageRepository.deleteByProduct(product);

        return createProductImages(product, images);
    }

    @Transactional
    @Override
    public void deleteProductImagesByProduct(Product product) {
        List<ProductImage> productImages = productImageRepository.findByProduct(product);
        if (productImages.isEmpty()) {
            return;
        }

        for (ProductImage productImage : productImages) {
            fileServiceClient.deleteFile(productImage.getImageUUID());
        }

        productImageRepository.deleteAll(productImages);
    }
}
