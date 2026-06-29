package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.response.ProductImageResponse;
import com.pharmacy_backend.product_service.entity.ProductImage;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface ProductImageMapper {

    ProductImageResponse toProductImageResponse(ProductImage productImage);

}
