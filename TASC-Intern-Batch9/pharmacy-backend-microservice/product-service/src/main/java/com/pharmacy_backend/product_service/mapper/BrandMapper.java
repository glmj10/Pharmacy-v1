package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.BrandRequest;
import com.pharmacy_backend.product_service.dto.response.BrandResponse;
import com.pharmacy_backend.product_service.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
//    @Mapping(target = "products", ignore = true)
    Brand toBrand(BrandRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
//    @Mapping(target = "products", ignore = true)
    Brand toBrandUpdateFromRequest(BrandRequest request, @MappingTarget Brand brand);

    BrandResponse toBrandResponse(Brand brand);
}
