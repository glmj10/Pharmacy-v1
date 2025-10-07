package com.pharmacy_backend.identity_service.service;


import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.identity_service.dto.request.RoleRequest;
import com.pharmacy_backend.identity_service.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    ApiResponse<RoleResponse> getRoleById(Long id);
    ApiResponse<List<RoleResponse>> getAllRoles(String code, String name);
    ApiResponse<RoleResponse> createRole(RoleRequest request);
    ApiResponse<RoleResponse> updateRole(Long id, RoleRequest request);
}
