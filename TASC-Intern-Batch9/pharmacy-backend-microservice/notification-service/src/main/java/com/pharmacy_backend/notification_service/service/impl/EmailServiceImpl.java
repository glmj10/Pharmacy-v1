package com.pharmacy_backend.notification_service.service.impl;

import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import com.pharmacy_backend.notification_service.service.EmailService;
import com.pharmacy_backend.notification_service.utils.EmailUtils;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    @Value("${spring.mail.username}")
    private String fromEmail;

    private final EmailUtils emailUtils;
    private final JavaMailSender mailSender;

    @Override
    public void sendOrderConfirmationEmail(OrderEvent order) {
        String subject = "Xác nhận đơn hàng #" + order.getOrderId();
        String html = EmailUtils.buildOrderConfirmationEmail(order,
                EmailUtils.buildOrderDetailRow(order.getOrderDetailEventList()));

        send(order.getUserEmail(), subject, html);
    }

    @Override
    public void sendResetEmail(String email, String otp, int expiryMinutes){
        String subject = "Yêu cầu đặt lại mật khẩu";
        String html;
        html = emailUtils.buildResetPasswordEmail(otp, expiryMinutes);
        send(email, subject, html);
    }

    @Override
    public void sendVerificationEmail(String email, String otp, int expiryMinutes) {
        String subject = "Xác thực tài khoản";
        String html = emailUtils.buildVerifyAccountEmail(otp, expiryMinutes);
        send(email, subject, html);
    }

    public void send(String to, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            helper.setFrom(fromEmail, "Nhà Thuốc Pharmacy");

            mailSender.send(message);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi gửi email: " + e.getMessage());
        }
    }

}
