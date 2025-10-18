package com.pharmacy_backend.category_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CategoryParentAndChildResponse {
    CategoryResponse parent;
    List<CategoryResponse> children;
}
