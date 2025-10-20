package com.pharmacy_backend.blog_service.mapper;

import org.mapstruct.Mapper;
import com.pharmacy_backend.blog_service.dto.response.CategoryResponse;
import com.pharmacy_backend.blog_service.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    CategoryResponse toCategoryResponse(Category category);
}

