package com.pharmacy_backend.identity_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.identity_service.dto.request.ChangeUserRoleRequest;
import com.pharmacy_backend.identity_service.dto.request.UserSearchCriteria;
import com.pharmacy_backend.identity_service.dto.response.PageResponse;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    ApiResponse<UserResponse> changeUserRole(Long userId, ChangeUserRoleRequest request);
    ApiResponse<UserResponse> getUserById(Long userId);
    ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex, Integer pageSize, UserSearchCriteria criteria);
    ApiResponse<UserResponse> getCurrentUser();
    ApiResponse<Long> getTotalUser();
}
