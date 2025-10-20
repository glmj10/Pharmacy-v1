package com.pharmacy_backend.product_service.service.impl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.mapper.BrandMapper;
import com.pharmacy_backend.product_service.mapper.CategoryMapper;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.repository.CategoryRepository;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.service.ProductImageService;
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
    private final FileServiceClient fileServiceClient;
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
        productResponse.setThumbnailUrl(getThumbnailUrl(product.getThumbnail()));
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream()
                .map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));

        return productResponse;
    }

    private String getThumbnailUrl(String uuid) {
        if(uuid != null && !uuid.isEmpty()) {
            return String.valueOf(fileServiceClient.getFileUrl(uuid).getData());
        }
        return null;
    }
}
