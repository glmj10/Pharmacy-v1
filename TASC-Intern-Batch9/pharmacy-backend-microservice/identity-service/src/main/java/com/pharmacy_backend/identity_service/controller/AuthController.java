package com.pharmacy_backend.identity_service.controller;

import com.nimbusds.jose.JOSEException;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.identity_service.dto.request.*;
import com.pharmacy_backend.identity_service.dto.response.AuthResponse;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import com.pharmacy_backend.identity_service.service.AuthService;
import com.pharmacy_backend.identity_service.kafka.producer.UserProducer;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.MessagingException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;

@RestController
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    final AuthService authService;
    final UserProducer userProducer;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest request) {
        ApiResponse<AuthResponse> response = authService.login(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

//    @PostMapping("/register")
//    public ResponseEntity<ApiResponse<String>> register(@RequestBody @Valid RegistrationRequest request) {
//        ApiResponse<String> response = authService.register(request);
//        return ResponseEntity.status(response.getStatus()).body(response);
//    }

    @PatchMapping("/verify")
    public ResponseEntity<ApiResponse<String>> verifyAccount(@RequestParam String token) {
        ApiResponse<String> response = authService.verifyAccount(token);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

//    @PostMapping("/send-verification-email")
//    public ResponseEntity<ApiResponse<Void>> sendVerifyEmail(@RequestParam String email) {
//        ApiResponse<Void> response = emailService.resendVerificationEmail(email);
//        return ResponseEntity.status(response.getStatus()).body(response);
//    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestHeader("Authorization") String bearerToken)
            throws ParseException {
        ApiResponse<Void> response = authService.logout(bearerToken);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        ApiResponse<String> response = authService.changePassword(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(@RequestBody RefreshRequest request)
            throws ParseException, JOSEException {
        ApiResponse<AuthResponse> response = authService.refreshToken(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> sendResetPasswordEmail(@RequestParam String email)
            throws MessagingException, UnsupportedEncodingException {
        ApiResponse<String> response = authService.forgotPassword(email, true);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request)
            throws ParseException {
        ApiResponse<String> response = authService.resetPassword(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @PutMapping("/info")
    public ResponseEntity<ApiResponse<UserResponse>> changeInfo(@RequestPart(value = "info", required = false) @Valid UserInfoRequest request,
                                                                @RequestPart(value = "profilePic", required = false) MultipartFile avatar) {
        ApiResponse<UserResponse> response = authService.changeInfo(request, avatar);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/test-event")
    public ResponseEntity<String> testEvent(@RequestParam String message) {
        userProducer.sendMessage(message);
        return ResponseEntity.ok("Message sent to Kafka topic");
    }

}
