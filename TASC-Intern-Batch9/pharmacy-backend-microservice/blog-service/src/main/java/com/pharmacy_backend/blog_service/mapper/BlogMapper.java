package com.pharmacy_backend.blog_service.mapper;

import com.pharmacy_backend.blog_service.dto.request.BlogRequest;
import com.pharmacy_backend.blog_service.dto.response.BlogResponse;
import com.pharmacy_backend.blog_service.dto.response.CategoryResponse;
import com.pharmacy_backend.blog_service.entity.Blog;
import com.pharmacy_backend.blog_service.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BlogMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Blog toBlog(BlogRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "thumbnail", ignore = true)
    Blog toBlogUpdateFromRequest(BlogRequest request, @MappingTarget Blog blog);

    @Mapping(target = "category", source = "category")
    BlogResponse toBlogResponse(Blog blog);
}
