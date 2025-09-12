package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.ChangeUserRoleRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    ApiResponse<UserResponse> changeUserRole(Long userId, ChangeUserRoleRequest request);
    ApiResponse<UserResponse> getUserById(Long userId);
    ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex, Integer pageSize, String email);
    ApiResponse<UserResponse> getCurrentUser();
    ApiResponse<Long> getTotalUser();
}
