package com.project.pharmacy.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryResponse {
    Long id;
    String name;
    String thumbnail;
    String slug;
    Long priority;
    TypeResponse type;
    Long parentId;
    List<CategoryResponse> children;
}
