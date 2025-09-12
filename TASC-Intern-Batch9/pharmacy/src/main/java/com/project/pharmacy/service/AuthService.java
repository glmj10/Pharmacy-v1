package com.project.pharmacy.service;

import com.nimbusds.jose.JOSEException;
import com.project.pharmacy.dto.request.*;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.AuthResponse;
import com.project.pharmacy.dto.response.UserResponse;
import jakarta.mail.MessagingException;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;

public interface AuthService {
    ApiResponse<AuthResponse> login(AuthRequest request);
    ApiResponse<String> register(RegistrationRequest request);
    ApiResponse<String> verifyAccount(String token);
    ApiResponse<String> resetPassword(ResetPasswordRequest request) throws ParseException;
    ApiResponse<String> forgotPassword(String email, Boolean isUser)
            throws MessagingException, UnsupportedEncodingException;
    ApiResponse<String> changePassword(ChangePasswordRequest changePasswordRequest);
    ApiResponse<UserResponse> changeInfo(UserRequest request);
    ApiResponse<Void> logout(String bearerToken) throws ParseException;
    ApiResponse<AuthResponse> refreshToken(String token) throws ParseException, JOSEException;
}
