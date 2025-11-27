package com.pharmacy_backend.notification_service.service;

import com.pharmacy_backend.common.kafka.event.OrderEvent;
import jakarta.mail.MessagingException;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;

public interface EmailService {
    void sendOrderConfirmationEmail(OrderEvent order)
            throws MessagingException, UnsupportedEncodingException;

    void sendResetEmail(String email, String otp, int expiryMinutes)
            throws MessagingException, UnsupportedEncodingException;

    void sendVerificationEmail(String email, String otp, int expiryM);
//    ApiResponse<Void> resendVerificationEmail(String email);
}
