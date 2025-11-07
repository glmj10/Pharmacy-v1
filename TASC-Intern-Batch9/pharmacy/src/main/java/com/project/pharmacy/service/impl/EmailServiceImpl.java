package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.entity.Order;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.entity.VerificationToken;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.repository.VerificationTokenRepository;
import com.project.pharmacy.security.JWTAuthenticationProvider;
import com.project.pharmacy.service.EmailService;
import com.project.pharmacy.utils.EmailUtils;
import jakarta.mail.internet.MimeMessage;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {
    @Value("${spring.mail.username}")
    private String fromEmail;

    private final EmailUtils emailUtils;

    private final JavaMailSender mailSender;

    private final JWTAuthenticationProvider jwtAuthenticationProvider;

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;

    @Override
    public void sendOrderConfirmationEmail(Order order, String userEmail) {
        String subject = "Xác nhận đơn hàng #" + order.getId();
        String html = EmailUtils.buildOrderConfirmationEmail(order.getCustomerName(),
                order.getCustomerPhoneNumber(), order.getCustomerAddress(), order, EmailUtils.buildOrderDetailRow(order.getOrderDetails()));

        send(userEmail, subject, html);
    }

    @Override
    public void sendResetEmail(String email, String token, LocalDateTime expiryAt, Boolean isUser){
        String subject = "Yêu cầu đặt lại mật khẩu";
        String html;
        if(isUser) {
            html = emailUtils.buildUserResetPasswordEmail(token, expiryAt);
        } else {
            html = emailUtils.buildAdminResetPasswordEmail(token, expiryAt);
        }
        send(email, subject, html);
    }

    @Override
    public void sendVerificationEmail(String email, String token, LocalDateTime expiryAt) {
        String subject = "Xác thực tài khoản";
        String html = emailUtils.buildVerifyAccountEmail(token, expiryAt);
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
                    HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi gửi email" + e.getMessage());
        }
    }
}
