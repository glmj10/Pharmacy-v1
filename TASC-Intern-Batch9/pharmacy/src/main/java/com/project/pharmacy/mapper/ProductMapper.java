package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.ProductRequest;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface ProductMapper {

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
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "inWishlist", ignore = true)
    @Mapping(target = "categories", ignore = true)
    @Mapping(target = "importPrice", ignore = true)
    ProductResponse toProductResponse(Product product);

}
