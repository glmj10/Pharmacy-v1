package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.BrandRequest;
import com.project.pharmacy.dto.response.BrandResponse;
import com.project.pharmacy.entity.Brand;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BrandMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "products", ignore = true)
    Brand toBrand(BrandRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "products", ignore = true)
    Brand toBrandUpdateFromRequest(BrandRequest request, @MappingTarget Brand brand);

    BrandResponse toBrandResponse(Brand brand);
}
