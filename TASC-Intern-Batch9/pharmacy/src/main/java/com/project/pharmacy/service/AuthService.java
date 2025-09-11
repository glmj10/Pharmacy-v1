package com.project.pharmacy.service;

import com.cloudinary.Api;
import com.project.pharmacy.dto.request.AuthRequest;
import com.project.pharmacy.dto.request.ChangePasswordRequest;
import com.project.pharmacy.dto.request.RegistrationRequest;
import com.project.pharmacy.dto.request.UserRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.AuthResponse;
import com.project.pharmacy.dto.response.UserResponse;

import java.text.ParseException;

public interface AuthService {
    ApiResponse<AuthResponse> login(AuthRequest request);
    ApiResponse<String> register(RegistrationRequest request);
    ApiResponse<String> verifyAccount(String token);
    ApiResponse<String> resetPassword(ChangePasswordRequest request);
    ApiResponse<String> forgotPassword(String email, Boolean isUser);
    ApiResponse<String> changePassword(ChangePasswordRequest changePasswordRequest);
    ApiResponse<UserResponse> changeInfo(UserRequest request);
    ApiResponse<Void> logout(String bearerToken) throws ParseException;
    ApiResponse<AuthResponse> refreshToken(String refreshToken);
}
