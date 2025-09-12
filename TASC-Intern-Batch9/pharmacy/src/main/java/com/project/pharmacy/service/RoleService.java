package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.RoleRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    ApiResponse<RoleResponse> getRoleById(Long id);
    ApiResponse<List<RoleResponse>> getAllRoles(String code, String name);
    ApiResponse<RoleResponse> createRole(RoleRequest request);
    ApiResponse<RoleResponse> updateRole(Long id, RoleRequest request);
}
