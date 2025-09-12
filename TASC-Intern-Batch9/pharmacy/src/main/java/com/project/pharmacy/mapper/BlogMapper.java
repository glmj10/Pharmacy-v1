package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.BlogRequest;
import com.project.pharmacy.dto.response.BlogResponse;
import com.project.pharmacy.dto.response.CategoryResponse;
import com.project.pharmacy.entity.Blog;
import com.project.pharmacy.entity.Category;
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

    @Mapping(target = "children", ignore = true)
    @Mapping(target = "priority", ignore = true)
    @Mapping(target = "parentId", ignore = true)
    CategoryResponse toCategoryResponse(Category category);

}
