package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.ProductRequest;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "productImages", ignore = true)
    @Mapping(target = "numberOfLikes", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "wishlists", ignore = true)
    @Mapping(target = "active", constant = "true")
    Product toProduct(ProductRequest request);

    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "productImages", ignore = true)
    @Mapping(target = "numberOfLikes", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "wishlists", ignore = true)
    @Mapping(target = "active", constant = "true")
    Product toProductUpdateFromRequest(ProductRequest request, @MappingTarget Product product);

    @Mapping(target = "images", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "inWishlist", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "importPrice", ignore = true)
    @Mapping(target = "description", ignore = true)
    ProductResponse toProductResponse(Product product);

}
