package com.pharmacy_backend.product_service.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductResponse {
    Long id;
    String thumbnail;
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
