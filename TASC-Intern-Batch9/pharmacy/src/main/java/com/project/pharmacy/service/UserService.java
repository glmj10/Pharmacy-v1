package com.project.pharmacy.service;


import com.project.pharmacy.dto.request.ChangePasswordRequest;
import com.project.pharmacy.dto.response.ApiResponse;

public interface UserService {
    ApiResponse<Void> logout(String token);
    ApiResponse<Void> changePassword(ChangePasswordRequest request);
}
