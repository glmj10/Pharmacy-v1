package com.project.pharmacy.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.entity.Category;
import com.project.pharmacy.entity.FileMetadata;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.enums.RedisKeyTypeEnum;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.BrandMapper;
import com.project.pharmacy.mapper.CategoryMapper;
import com.project.pharmacy.mapper.ProductMapper;
import com.project.pharmacy.repository.CategoryRepository;
import com.project.pharmacy.repository.FileMetadataRepository;
import com.project.pharmacy.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductRedisService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ProductMapper productMapper;
    private final FileMetadataRepository fileMetadataRepository;
    private final ProductImageService productImageService;
    private final BrandMapper brandMapper;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public void cacheProductDetail(Product product){
        ProductResponse productResponse = buildProductResponse(product);
        String key = RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + productResponse.getSlug();
        try {
            String json = objectMapper.writeValueAsString(productResponse);
            redisTemplate.opsForValue().set(key, json);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to cache product data");
        }
    }

    public ProductResponse getCachedProductDetail(String slug) {
        String key = RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + slug;
        String productJson = redisTemplate.opsForValue().get(key);
        if (productJson != null) {
            try {
                return objectMapper.readValue(productJson, ProductResponse.class);
            } catch (Exception e) {
                e.printStackTrace();
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Failed to parse cached product data");
            }
        }
        return null;
    }

    public ProductResponse buildProductResponse(Product product) {
        ProductResponse productResponse = productMapper.toProductResponse(product);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
        productResponse.setThumbnailUrl(fileMetadata.getUrl());
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream()
                .map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));

        return productResponse;
    }
}
