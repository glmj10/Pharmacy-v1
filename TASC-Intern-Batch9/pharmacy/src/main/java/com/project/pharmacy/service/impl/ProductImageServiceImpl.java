package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.response.ProductImageResponse;
import com.project.pharmacy.entity.FileMetadata;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.entity.ProductImage;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.enums.FileCategoryEnum;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.ProductImageMapper;
import com.project.pharmacy.repository.FileMetadataRepository;
import com.project.pharmacy.repository.ProductImageRepository;
import com.project.pharmacy.service.FileMetadataService;
import com.project.pharmacy.service.ProductImageService;
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
    private final FileMetadataService fileMetadataService;
    private final ProductImageMapper productImageMapper;
    private final FileMetadataRepository fileMetadataRepository;

    @Transactional
    @Override
    public List<ProductImageResponse> getProductImagesByProduct(Product product) {
        return productImageRepository.findByProduct(product)
                .stream()
                .map(productImage -> {
                    ProductImageResponse response = productImageMapper.toProductImageResponse(productImage);
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(productImage.getImageUUID()))
                            .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy file với uuid: " + productImage.getImageUUID()));
                    response.setImageUrl(fileMetadata.getUrl());

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
                    var fileMetadata = fileMetadataService.storeFile(image, FileCategoryEnum.PRODUCT.name());
                    ProductImage productImage = new ProductImage();
                    productImage.setProduct(product);
                    productImage.setImageUUID(fileMetadata.getData().getId().toString());

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
            fileMetadataService.deleteFile(productImage.getImageUUID());
        }

        productImageRepository.deleteAll(productImages);
    }
}
