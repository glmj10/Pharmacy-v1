package com.pharmacy_backend.product_service.dto.response;

import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductResponse {
    Long id;
    String thumbnailUrl;
    String title;
    Integer priceOld;
    Integer priceNew;
    Integer importPrice;
    Integer quantity;
    String manufacturer;
    String productType;
    String noted;
    String indication;
    String slug;
    Long priority;
    Boolean active;
    String description;
    String registrationNumber;
    String activeIngredient;
    String dosageForm;
    Boolean inWishlist;
    Long numberOfLikes;
    BrandResponse brand;
    List<CategoryResponse> categories;
    List<ProductImageResponse> images;
}
