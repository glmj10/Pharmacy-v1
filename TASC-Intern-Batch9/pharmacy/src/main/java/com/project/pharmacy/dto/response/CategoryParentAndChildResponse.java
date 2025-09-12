package com.project.pharmacy.dto.response;

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
