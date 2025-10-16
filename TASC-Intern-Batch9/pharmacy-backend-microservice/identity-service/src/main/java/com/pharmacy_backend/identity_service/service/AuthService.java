package com.pharmacy_backend.identity_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.nimbusds.jose.JOSEException;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.identity_service.dto.request.*;
import com.pharmacy_backend.identity_service.dto.response.AuthResponse;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import org.springframework.messaging.MessagingException;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;

public interface AuthService {
    ApiResponse<AuthResponse> login(AuthRequest request);
    ApiResponse<String> register(RegistrationRequest request);
    ApiResponse<String> verifyAccount(String token) throws ParseException;
    ApiResponse<String> resetPassword(ResetPasswordRequest request) throws ParseException;
    ApiResponse<String> forgotPassword(String email, Boolean isUser)
            throws MessagingException, UnsupportedEncodingException, ParseException;
    ApiResponse<String> changePassword(ChangePasswordRequest request);
    ApiResponse<UserResponse> changeInfo(UserInfoRequest request, MultipartFile profilePic);

    ApiResponse<Void> logout(String bearerToken) throws ParseException;
    ApiResponse<AuthResponse> refreshToken(RefreshRequest request) throws ParseException, JOSEException;
}
