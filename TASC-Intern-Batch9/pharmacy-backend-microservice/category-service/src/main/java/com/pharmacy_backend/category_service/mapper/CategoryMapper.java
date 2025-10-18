package com.pharmacy_backend.category_service.mapper;

import com.project.pharmacy.dto.request.CategoryRequest;
import com.project.pharmacy.dto.response.CategoryResponse;
import com.project.pharmacy.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "child", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "blogs", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "type", ignore = true)
    Category toCategory(CategoryRequest request);

    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "child", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "products", ignore = true)
    @Mapping(target = "blogs", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "type", ignore = true)
    Category toCategoryUpdateFromRequest(CategoryRequest request, @MappingTarget Category category);

    @Mapping(target = "children", ignore = true)
    @Mapping(target = "type", ignore = true)
    CategoryResponse toCategoryResponse(Category category);

}

