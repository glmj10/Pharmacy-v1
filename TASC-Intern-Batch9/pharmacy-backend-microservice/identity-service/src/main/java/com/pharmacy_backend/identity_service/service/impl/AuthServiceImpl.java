package com.pharmacy_backend.identity_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.exceptions.ValidationException;
import com.pharmacy_backend.common.kafka.event.UserRegisteredEvent;
import com.pharmacy_backend.common.kafka.event.UserVerifyAccountEvent;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.DateUtils;
import com.pharmacy_backend.identity_service.config.KafkaConfig;
import com.pharmacy_backend.identity_service.dto.request.*;
import com.pharmacy_backend.identity_service.dto.response.AuthResponse;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import com.pharmacy_backend.identity_service.entity.OutboxEvent;
import com.pharmacy_backend.identity_service.entity.Role;
import com.pharmacy_backend.identity_service.entity.User;
import com.pharmacy_backend.identity_service.repository.OutboxRepository;
import com.pharmacy_backend.identity_service.repository.RoleRepository;
import com.pharmacy_backend.identity_service.repository.UserRepository;
import com.pharmacy_backend.identity_service.security.JWTAuthenticationProvider;
import com.pharmacy_backend.identity_service.service.AuthService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.MessagingException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.time.LocalDateTime;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    PasswordEncoder passwordEncoder;
    UserRepository userRepository;
    RoleRepository roleRepository;
    JWTAuthenticationProvider jwtAuthenticationProvider;
    ObjectMapper objectMapper;
    OutboxRepository outboxRepository;

    @Override
    public ApiResponse<AuthResponse> login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR,
                        "Email hoặc mật khẩu không chính xác"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Email hoặc mật khẩu không chính xác");
        }

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtAuthenticationProvider.generateToken(user));
        return ApiResponse.buildOkResponse(authResponse, "Đăng nhập thành công");
    }

    @Override
    public ApiResponse<String> register(RegistrationRequest request) throws JsonProcessingException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("email", "Nguời dùng đã tồn tại", request.getEmail());
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("confirmPassword", "Mật khẩu không khớp", request.getConfirmPassword());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Role role = roleRepository.findByCode("USER")
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR, "Không tìm thấy quyền người dùng"));
        user.getRoles().add(role);
        userRepository.save(user);

        UserRegisteredEvent userRegisteredEvent = new UserRegisteredEvent(user.getId());
        String json = objectMapper.writeValueAsString(userRegisteredEvent);

        handleSaveOutboxEvent(user, KafkaConfig.USER_REGISTERED_TOPIC, json);
        //send message queue to cart-service to create cart for user
        String token = jwtAuthenticationProvider.generateVerificationToken(user);
        Long expiryTime = DateUtils.convertToMillis(jwtAuthenticationProvider.getTokenExpiry(token));

        UserVerifyAccountEvent userVerifyAccountEvent = new UserVerifyAccountEvent(

        );
        //send message queue to notification-service to send verify email
        return ApiResponse.buildCreatedResponse(null, "Đăng ký thành công");
    }

    @Override
    public ApiResponse<String> verifyAccount(String token) {
        return null;
    }

    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) throws ParseException {
        return null;
    }

    @Override
    public ApiResponse<String> forgotPassword(String email, Boolean isUser) throws MessagingException, UnsupportedEncodingException {
        return null;
    }

    @Override
    public ApiResponse<String> changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không tồn tại"));
        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu cũ không chính xác");
        }
        if(!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới không khớp");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        return ApiResponse.buildOkResponse(null, "Đổi mật khẩu thành công");
    }

    @Override
    public ApiResponse<UserResponse> changeInfo(UserInfoRequest request, MultipartFile profilePic) {
        return null;
    }

    @Override
    public ApiResponse<Void> logout(String bearerToken) throws ParseException {
        if(bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token không hợp lệ");
        }

        String token = bearerToken.substring(7);
        SignedJWT jwt = SignedJWT.parse(token);
        String jti = jwt.getJWTClaimsSet().getJWTID();
//        LocalDateTime expiry = DateUtils.convertToLocalDateTime(jwt.getJWTClaimsSet().getExpirationTime());
//        invalidateTokenIfAbsent(jti, expiry);
        return ApiResponse.buildOkResponse(null, "Đăng xuất thành công");
    }

    @Override
    public ApiResponse<AuthResponse> refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        SignedJWT signedJWT = jwtAuthenticationProvider.verifyToken(request.getToken(), true);
        long userId = (long) signedJWT.getJWTClaimsSet().getClaim("id");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

//        String oldJti = signedJWT.getJWTClaimsSet().getJWTID();
//        LocalDateTime oldExpiry = DateUtils.convertToLocalDateTime(signedJWT.getJWTClaimsSet().getExpirationTime());
//        invalidateTokenIfAbsent(oldJti, oldExpiry);

        String newToken = jwtAuthenticationProvider.generateToken(user);
        AuthResponse authResponse = new AuthResponse(newToken);
        return ApiResponse.buildOkResponse(authResponse, "Làm mới phiên đăng nhập thành công");
    }

    private void handleSaveOutboxEvent(User user, String eventType, String payload) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType("USER");
        outboxEvent.setAggregateId(user.getId());
        outboxEvent.setEventType(eventType);
        outboxEvent.setPayload(payload);
        outboxRepository.save(outboxEvent);
    }
}
