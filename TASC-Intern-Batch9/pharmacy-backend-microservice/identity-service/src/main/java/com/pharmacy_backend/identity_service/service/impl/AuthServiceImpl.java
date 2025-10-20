package com.pharmacy_backend.identity_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.exceptions.ValidationException;
import com.pharmacy_backend.common.kafka.event.UserForgotPasswordEvent;
import com.pharmacy_backend.common.kafka.event.UserVerifyAccountEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.DateUtils;
import com.pharmacy_backend.identity_service.dto.request.*;
import com.pharmacy_backend.identity_service.dto.response.AuthResponse;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import com.pharmacy_backend.identity_service.entity.OutboxEvent;
import com.pharmacy_backend.identity_service.entity.Role;
import com.pharmacy_backend.identity_service.entity.User;
import com.pharmacy_backend.common.kafka.event.UserCreatedEvent;
import com.pharmacy_backend.identity_service.mapper.UserMapper;
import com.pharmacy_backend.identity_service.repository.OutboxRepository;
import com.pharmacy_backend.identity_service.repository.RoleRepository;
import com.pharmacy_backend.identity_service.repository.UserRepository;
import com.pharmacy_backend.identity_service.security.JWTAuthenticationProvider;
import com.pharmacy_backend.identity_service.service.AuthService;
import com.pharmacy_backend.identity_service.service.FileServiceClient;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.MessagingException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.ParseException;
import java.util.Date;


@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    final PasswordEncoder passwordEncoder;
    final UserRepository userRepository;
    final RoleRepository roleRepository;
    final JWTAuthenticationProvider jwtAuthenticationProvider;
    final ObjectMapper objectMapper;
    final OutboxRepository outboxRepository;
    final RedisService redisService;
    final UserMapper userMapper;
    final FileServiceClient fileServiceClient;

    @Value("${spring.application.name}")
    String appName;

    @Override
    public ApiResponse<AuthResponse> login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR,
                        "Email hoặc mật khẩu không chính xác"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Email hoặc mật khẩu không chính xác");
        }

        if(!user.isVerified()) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR,
                    "Tài khoản chưa được kích hoạt, vui lòng kiểm tra email để xác thực");
        }

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(jwtAuthenticationProvider.generateToken(user));
        return ApiResponse.buildOkResponse(authResponse, "Đăng nhập thành công");
    }

    @Transactional
    @Override
    public ApiResponse<String> register(RegistrationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("email",
                    "Email đã tồn tại", request.getEmail());
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new ValidationException("confirmPassword",
                    "Mật khẩu không khớp", request.getConfirmPassword());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        Role role = roleRepository.findByCode("USER")
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR, "Không tìm thấy quyền người dùng"));
        user.getRoles().add(role);
        userRepository.save(user);

        UserCreatedEvent userCreatedEvent = new UserCreatedEvent(user.getId(), user.getEmail());
        Event<UserCreatedEvent> event = Event.<UserCreatedEvent>builder()
                .source(appName)
                .eventType(EventTypeEnum.USER_CREATED.getName())
                .key(String.format("%s-%d", PartitionKeyEnum.USER, user.getId()))
                .data(userCreatedEvent).
                build();
        //send message queue to profile-service, cart-service to create profile for new user
        handleSaveOutboxEvent(event);

        String token = jwtAuthenticationProvider.generateVerificationToken(user);
        long expiryTime = DateUtils.convertToMillis(jwtAuthenticationProvider.getTokenExpiry(token));

        UserVerifyAccountEvent userVerifyAccountEvent = new UserVerifyAccountEvent(
                user.getEmail(),
                token,
                DateUtils.convertToLocalDateTime(new Date(System.currentTimeMillis() + expiryTime))
        );

        Event<UserVerifyAccountEvent> verifyEvent = Event.<UserVerifyAccountEvent>builder()
                .source(appName)
                .eventType(EventTypeEnum.USER_VERIFIED.getName())
                .key(String.format("%s-%d", PartitionKeyEnum.USER, user.getId()))
                .data(userVerifyAccountEvent).
                build();

        handleSaveOutboxEvent(verifyEvent);
        try {
            redisService.storeVerificationToken(jwtAuthenticationProvider.getJWTID(token), expiryTime);
        } catch (ParseException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
        }
        return ApiResponse.buildCreatedResponse(null, "Đăng ký thành công," +
                " vui lòng kiểm tra email để xác thực tài khoản");
    }

    @Transactional
    @Override
    public ApiResponse<String> verifyAccount(String token) throws ParseException {
        String jti = jwtAuthenticationProvider.getJWTID(token);
        if(!redisService.isVerificationTokenValid(jti)) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token không hợp lệ hoặc đã hết hạn");
        }

        User user = userRepository.findByEmail(jwtAuthenticationProvider.getUserEmail(token))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        user.setStatusEmail(true);
        userRepository.save(user);
        redisService.removeVerificationToken(jti);

        return ApiResponse.buildOkResponse(null, "Xác thực tài khoản thành công, vui lòng đăng nhập");
    }

    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) throws ParseException {
        String jti = jwtAuthenticationProvider.getJWTID(request.getResetToken());
        if(!redisService.isResetPasswordTokenValid(jti)) {
            throw new CustomException(
                    ErrorCode.VALIDATION_ERROR
                    , "Token không hợp lệ hoặc đã hết hạn"
            );
        }

        User user = userRepository.findByEmail(
                jwtAuthenticationProvider.getUserEmail(request.getResetToken()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu không khớp");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        user.setTokenVersion(user.getTokenVersion());
        redisService.removeResetPasswordToken(jti);
        redisService.storeUserVersion(user.getId(), user.getTokenVersion());
        return ApiResponse.buildOkResponse(
                null,
                "Đặt lại mật khẩu thành công"
        );
    }

    @Override
    public ApiResponse<String> forgotPassword(String email, Boolean isUser)
            throws MessagingException, ParseException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        String token = jwtAuthenticationProvider.generatePasswordResetToken(user);
        UserForgotPasswordEvent userForgotPasswordEvent = new UserForgotPasswordEvent();
        userForgotPasswordEvent.setEmail(user.getEmail());
        userForgotPasswordEvent.setResetPasswordToken(token);
        userForgotPasswordEvent.setExpiryAt(jwtAuthenticationProvider.getTokenExpiry(token));
        userForgotPasswordEvent.setUser(isUser);

        Event<UserForgotPasswordEvent> event = Event.<UserForgotPasswordEvent>builder()
                .source(appName)
                .key(String.format("%s-%d", PartitionKeyEnum.USER.getName(), user.getId()))
                .eventType(EventTypeEnum.PASSWORD_RESET.getName())
                .data(userForgotPasswordEvent)
                .build();

        handleSaveOutboxEvent(event);

        Long expiryTime = DateUtils.convertToMillis(
                jwtAuthenticationProvider.getTokenExpiry(token)
        );
        redisService.storeResetPasswordToken(
                jwtAuthenticationProvider.getJWTID(token), expiryTime);

        return ApiResponse.buildOkResponse(null,
                "Gửi email thành công, vui lòng kiểm tra email để đặt lại mật khẩu");
    }

    @Override
    public ApiResponse<String> changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new CustomException(
                        ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không tồn tại"
                        )
                );
        if(!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new CustomException(
                    ErrorCode.VALIDATION_ERROR, "Mật khẩu cũ không chính xác");
        }
        if(!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới không khớp");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
        redisService.storeUserVersion(user.getId(), user.getTokenVersion());
        return ApiResponse.buildOkResponse(null, "Đổi mật khẩu thành công");
    }

    @Override
    public ApiResponse<UserResponse> changeInfo(UserInfoRequest request, MultipartFile profilePic) {
        Long id = SecurityUtils.getCurrentUserId();
        assert id != null;
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        if(request != null) {
            user.setUsername(request.getUsername());
        }

        if(profilePic != null) {
            fileServiceClient.deleteFile((user.getProfilePic() != null) ? user.getProfilePic() : "");
            ApiResponse<FileMetadataResponse> fileResponse = fileServiceClient.uploadFile(profilePic,
                    FileCategoryEnum.AVATAR.name());
            if(user.getProfilePic() != null && !user.getProfilePic().isEmpty()) {
                fileServiceClient.deleteFile(user.getProfilePic());
            }
            user.setProfilePic(fileResponse.getData().getId().toString());
        }

        UserResponse userResponse = userMapper.toUserResponse(userRepository.save(user));
        if(user.getProfilePic() != null && !user.getProfilePic().isEmpty()) {
            String profilePicUrl = fileServiceClient.getFileUrl(user.getProfilePic()).getData();
            userResponse.setProfilePicUrl(profilePicUrl);
        }
        userResponse.setRoles(null);
        return ApiResponse.buildOkResponse(userResponse, "Cập nhật thông tin người dùng thành công");
    }

    @Override
    public ApiResponse<Void> logout(String bearerToken) throws ParseException {
        if(bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token không hợp lệ");
        }

        String token = bearerToken.substring(7);
        SignedJWT jwt = SignedJWT.parse(token);
        String jti = jwt.getJWTClaimsSet().getJWTID();
        Date expiry = jwt.getJWTClaimsSet().getExpirationTime();
        redisService.storeInvalidatedToken(jti, expiry.getTime());
        return ApiResponse.buildOkResponse(null, "Đăng xuất thành công");
    }

    @Override
    public ApiResponse<AuthResponse> refreshToken(RefreshRequest request)
            throws ParseException, JOSEException {
        SignedJWT signedJWT = jwtAuthenticationProvider.verifyToken(request.getToken(), true);
        long userId = (long) signedJWT.getJWTClaimsSet().getClaim("id");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        String oldJti = signedJWT.getJWTClaimsSet().getJWTID();
        Date oldExpiry = signedJWT.getJWTClaimsSet().getExpirationTime();

        redisService.storeInvalidatedToken(oldJti, oldExpiry.getTime());
        String newToken = jwtAuthenticationProvider.generateToken(user);
        AuthResponse authResponse = new AuthResponse(newToken);
        return ApiResponse.buildOkResponse(
                authResponse,
                "Làm mới phiên đăng nhập thành công"
        );
    }

    @Override
    public ApiResponse<Void> resendVerificationToken(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                ErrorCode.USER_NOT_FOUND.getMessage()));

        if(user.isVerified()) {
            throw new CustomException(ErrorCode.USER_ALREADY_VERIFIED,
                    HttpStatus.BAD_REQUEST, "Tài khoản đã được xác thực");
        } else {
            String token = jwtAuthenticationProvider.generateVerificationToken(user);
            long expiryTime = DateUtils.convertToMillis(jwtAuthenticationProvider.getTokenExpiry(token));

            UserVerifyAccountEvent userVerifyAccountEvent = new UserVerifyAccountEvent(
                    user.getEmail(),
                    token,
                    DateUtils.convertToLocalDateTime(new Date(System.currentTimeMillis() + expiryTime))
            );

            Event<UserVerifyAccountEvent> verifyEvent = Event.<UserVerifyAccountEvent>builder()
                    .source(appName)
                    .eventType(EventTypeEnum.USER_VERIFIED.getName())
                    .key(String.format("%s-%d", PartitionKeyEnum.USER, user.getId()))
                    .data(userVerifyAccountEvent).
                    build();

            handleSaveOutboxEvent(verifyEvent);
            try {
                redisService.storeVerificationToken(jwtAuthenticationProvider.getJWTID(token), expiryTime);
            } catch (ParseException e) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
            }
            return ApiResponse.<Void>builder()
                    .status(HttpStatus.OK.value())
                    .message("Đã gửi lại email xác thực thành công, vui lòng kiểm tra email")
                    .data(null)
                    .build();
        }
    }

    public void handleSaveOutboxEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.USER.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.USER_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }
}
