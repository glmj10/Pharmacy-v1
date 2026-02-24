package com.pharmacy_backend.product_service.service.impl;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.config.AppConfig;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import com.pharmacy_backend.product_service.mapper.BrandMapper;
import com.pharmacy_backend.product_service.mapper.CategoryMapper;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.mapper.PromotionEventMapper;
import com.pharmacy_backend.product_service.repository.CategoryRepository;
import com.pharmacy_backend.product_service.repository.PromotionEventRepository;
import com.pharmacy_backend.product_service.repository.PromotionItemRepository;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.service.ProductImageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductRedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final ProductMapper productMapper;
    private final FileServiceClient fileServiceClient;
    private final ProductImageService productImageService;
    private final BrandMapper brandMapper;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final PromotionEventRepository promotionEventRepository;
    private final PromotionItemRepository promotionItemRepository;
    private final PromotionEventMapper promotionEventMapper;

    public void cacheProductDetail(Product product){
        ProductResponse productResponse = buildProductResponse(product);
        String key = RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + productResponse.getSlug();
        try {
            redisTemplate.opsForValue().set(key, productResponse,
                RedisKeyTypeEnum.PRODUCT_DETAIL.getDuration(), TimeUnit.SECONDS);
            log.debug("Successfully cached product detail for slug: {}", productResponse.getSlug());
        } catch (Exception e) {
            log.error("Failed to cache product data for slug: {}, error: {}", productResponse.getSlug(), e.getMessage());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    HttpStatus.INTERNAL_SERVER_ERROR, "Failed to cache product data: " + e.getMessage());
        }
    }

    public ProductResponse getCachedProductDetail(String slug) {
        String key = String.format("%s:%s", RedisKeyTypeEnum.PRODUCT_DETAIL.getKey(), slug);

        try {
            log.debug("Attempting to retrieve cached product for key: {}", key);
            log.debug("ValueSerializer: {}", redisTemplate.getValueSerializer().getClass().getName());

            Object cachedObject = redisTemplate.opsForValue().get(key);

            if (cachedObject != null) {
                log.debug("Found cached object of type: {}", cachedObject.getClass().getName());

                if (cachedObject instanceof ProductResponse) {
                    log.debug("Successfully retrieved ProductResponse from cache for slug: {}", slug);
                    return (ProductResponse) cachedObject;
                } else {
                    try {
                        ProductResponse converted = objectMapper.convertValue(cachedObject, ProductResponse.class);
                        log.debug("Successfully converted cached object to ProductResponse for slug: {}", slug);
                        return converted;
                    } catch (Exception convertException) {
                        log.warn("Failed to convert cached object to ProductResponse for slug: {}, error: {}",
                            slug, convertException.getMessage());
                        deleteCachedProductDetail(slug);
                        return null;
                    }
                }
            }

            log.debug("No cached data found for slug: {}", slug);
            return null;

        } catch (Exception e) {
            log.error("Error retrieving cached product for slug: {}, error: {}", slug, e.getMessage(), e);
            try {
                deleteCachedProductDetail(slug);
                log.info("Deleted corrupted cache for slug: {}", slug);
            } catch (Exception deleteException) {
                log.warn("Failed to delete corrupted cache for slug: {}, error: {}", slug, deleteException.getMessage());
            }
            return null;
        }
    }

    public void deleteCachedProductDetail(String slug) {
        String key = RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + slug;
        try {
            Boolean deleted = redisTemplate.delete(key);
            log.debug("Cache deletion for slug: {} - success: {}", slug, deleted);
        } catch (Exception e) {
            log.error("Failed to delete cache for slug: {}, error: {}", slug, e.getMessage());
        }
    }

    public void cacheRelatedProducts(long productId, List<String> relatedProductSLugs){
        try {
            String key = RedisKeyTypeEnum.RELATED_PRODUCTS.getKey() + ":" + productId;
            redisTemplate.opsForValue().set(key, relatedProductSLugs);
            log.debug("Successfully cached related products for key: {}", key);
        } catch (Exception e) {
            log.error("Failed to cache related product for productId: {}, error: {}", productId, e.getMessage());
        }
    }

    public List<String> getCachedRelatedProducts(long productId) {
        String key = RedisKeyTypeEnum.RELATED_PRODUCTS.getKey() + ":" + productId;
        try {
            Object cachedObject = redisTemplate.opsForValue().get(key);
            if (cachedObject != null && cachedObject instanceof List) {
                log.debug("Successfully retrieved cached related products for key: {}", key);
                return (List<String>) cachedObject;
            }
            log.debug("No cached related products found for key: {}", key);
            return null;
        } catch (Exception e) {
            log.error("Error retrieving cached related products for productId: {}, error: {}", productId, e.getMessage());
            return null;
        }
    }

    public List<ProductResponse> getMultipleCachedProductDetails(List<String> slugs) {
        try {
            List<String> keys = slugs.stream()
                    .map(slug -> RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + slug)
                    .collect(Collectors.toList());

            List<Object> cachedObjects = redisTemplate.opsForValue().multiGet(keys);

            if (cachedObjects == null) {
                log.debug("No cached data found for provided slugs.");
                return List.of();
            }

            for (int i = 0; i < cachedObjects.size(); i++) {
                Object obj = cachedObjects.get(i);
                log.info("Index {} -> type: {}", i, obj == null ? "null" : obj.getClass().getName());
            }

            List<ProductResponse> productResponses = cachedObjects.stream()
                    .filter(obj -> obj instanceof ProductResponse)
                    .map(obj -> (ProductResponse) obj)
                    .collect(Collectors.toList());

            log.debug("Successfully retrieved {} cached product details.", productResponses.size());
            return productResponses;

        } catch (Exception e) {
            log.error("Error retrieving multiple cached product details, error: {}", e.getMessage(), e);
            return List.of();
        }
    }

    public void deleteCachedRelatedProducts(long productId) {
        String key = RedisKeyTypeEnum.RELATED_PRODUCTS.getKey() + ":" + productId;
        try {
            Boolean deleted = redisTemplate.delete(key);
            log.debug("Related products cache deletion for productId: {} - success: {}", productId, deleted);
        } catch (Exception e) {
            log.error("Failed to delete related products cache for productId: {}, error: {}", productId, e.getMessage());
        }
    }

    public ProductResponse buildProductResponse(Product product) {
        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        productResponse.setDescription(product.getDescription());
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream()
                .map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));
        productResponse.setThumbnail(AppConfig.getImagePrefix() + product.getThumbnail());

        PromotionItem promotionItem = promotionItemRepository.findByProductId(product.getId())
                .orElse(null);
        if(promotionItem != null) {
            PromotionEvent promotionEvent = promotionEventRepository.findByIdAndStatus(
                    promotionItem.getPromotionEventId(), PromotionEventStatusEnum.ONGOING
                    )
                    .orElse(null);
            productResponse.setPromotionEvent(promotionEventMapper.toResponse(promotionEvent));
        }
        return productResponse;
    }

    public void deleteCacheProductDetail(List<String> slugs) {
        List<String> keys = slugs.stream()
                .map(slug -> RedisKeyTypeEnum.PRODUCT_DETAIL.getKey() + ":" + slug)
                .collect(Collectors.toList());
        try {
            Long deletedCount = redisTemplate.delete(keys);
            log.debug("Deleted {} cached product details.", deletedCount);
        } catch (Exception e) {
            log.error("Failed to delete cached product details, error: {}", e.getMessage());
        }
    }
}
