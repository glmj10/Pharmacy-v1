package com.pharmacy_backend.notification_service.service;

import jakarta.mail.MessagingException;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

public interface EmailService {
//    void sendOrderConfirmationEmail(Order order, String userEmail)
//            throws MessagingException, UnsupportedEncodingException;

    void sendResetEmail(String email, String token, LocalDateTime expiryAt, Boolean isUser)
            throws MessagingException, UnsupportedEncodingException;

    void sendVerificationEmail(String email, String token, LocalDateTime expiryAt);
//    ApiResponse<Void> resendVerificationEmail(String email);
}
