package com.project.pharmacy.controller;

import com.project.pharmacy.dto.request.AuthRequest;
import com.project.pharmacy.dto.request.ChangePasswordRequest;
import com.project.pharmacy.dto.request.RegistrationRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.AuthResponse;
import com.project.pharmacy.service.AuthService;
import com.project.pharmacy.service.EmailService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.text.ParseException;

@Controller
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    final AuthService authService;
    final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(@RequestBody @Valid RegistrationRequest request) {
        ApiResponse<String> response = authService.register(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PatchMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyAccount(@RequestParam String token) {
        ApiResponse<String> response = authService.verifyAccount(token);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/send-verification-email")
    public ResponseEntity<ApiResponse<Void>> sendVerifyEmail(@RequestParam String email) {
        ApiResponse<Void> response = emailService.resendVerificationEmail(email);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String bearerToken) throws ParseException {
        ApiResponse<Void> response = authService.logout(bearerToken);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        ApiResponse<String> response = authService.changePassword(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
