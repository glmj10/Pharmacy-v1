package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.response.ProductImageResponse;
import com.project.pharmacy.entity.ProductImage;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface ProductImageMapper {

    ProductImageResponse toProductImageResponse(ProductImage productImage);

}
