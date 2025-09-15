package com.project.pharmacy.service.impl;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.project.pharmacy.dto.request.*;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.AuthResponse;
import com.project.pharmacy.dto.response.UserResponse;
import com.project.pharmacy.entity.*;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.exceptions.ValidationException;
import com.project.pharmacy.repository.*;
import com.project.pharmacy.security.JWTAuthenticationProvider;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.AuthService;
import com.project.pharmacy.service.EmailService;
import com.project.pharmacy.utils.DateUtils;
import jakarta.mail.MessagingException;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;
import java.text.ParseException;
import java.time.LocalDateTime;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    final CartRepository cartRepository;
    final UserRepository userRepository;
    final PasswordEncoder passwordEncoder;
    final JWTAuthenticationProvider jwtAuthenticationProvider;
    final EmailService emailService;
    final VerificationTokenRepository verificationTokenRepository;
    final RoleRepository roleRepository;
    final InvalidatedTokenRepository invalidatedTokenRepository;
    final PasswordResetTokenRepository passwordResetTokenRepository;


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

        cartRepository.save(new Cart(user));

        String token = jwtAuthenticationProvider.generateVerificationToken(user);
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUser(user);
        verificationToken.setExpiryAt(jwtAuthenticationProvider.getTokenExpiry(token));
        verificationTokenRepository.save(verificationToken);

        emailService.sendVerificationEmail(user.getEmail(), token, jwtAuthenticationProvider.getTokenExpiry(token));
        return ApiResponse.buildOkResponse(null,
                "Đăng ký thành công, vui lòng kiểm tra email để kích hoạt tài khoản");
    }

    @Transactional
    @Override
    public ApiResponse<String> verifyAccount(String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR,
                        "Token không hợp lệ hoặc đã hết hạn"));

        if(verificationToken.isUsed()) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token đã được sử dụng");
        }

        if(verificationToken.getExpiryAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token đã hết hạn");
        }

        User user = verificationToken.getUser();
        user.setStatusEmail(true);

        verificationToken.changeTokenStatus(true);
        verificationTokenRepository.save(verificationToken);
        userRepository.save(user);
        return ApiResponse.buildOkResponse(null, "Xác thực tài khoản thành công, vui lòng đăng nhập");
    }

    @Transactional
    @Override
    public ApiResponse<String> resetPassword(ResetPasswordRequest request) throws ParseException {
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(request.getResetToken())
                .orElseThrow(() -> new CustomException(ErrorCode.VALIDATION_ERROR, "Token không hợp lệ"));

        User user = userRepository.findByEmail(jwtAuthenticationProvider.getUserEmail(request.getResetToken()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if(passwordResetToken.hasExpired()) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token đã hết hạn");
        }

        if(passwordResetToken.isUsed()) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token đã được sử dụng");
        }

        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu không khớp");
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        passwordResetToken.setUsed(true);
        passwordResetTokenRepository.save(passwordResetToken);
        return ApiResponse.buildOkResponse(null, "Đặt lại mật khẩu thành công");
    }

    @Transactional
    @Override
    public ApiResponse<String> forgotPassword(String email, Boolean isUser)
            throws MessagingException, UnsupportedEncodingException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        String token = jwtAuthenticationProvider.generatePasswordResetToken(user);
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(token);
        passwordResetToken.setExpiryAt(jwtAuthenticationProvider.getTokenExpiry(token));
        passwordResetTokenRepository.save(passwordResetToken);
        emailService.sendResetEmail(user.getEmail(), token, jwtAuthenticationProvider.getTokenExpiry(token), isUser);
        return ApiResponse.buildOkResponse(null,
                "Gửi email thành công, vui lòng kiểm tra email để đặt lại mật khẩu");
    }

    @Transactional
    @Override
    public ApiResponse<String> changePassword(ChangePasswordRequest request) {
        User user = userRepository.findByEmail(SecurityUtils.getCurrentUserEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không tồn tại"));
        if(!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu cũ không chính xác");
        }
        if(!request.getPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Mật khẩu mới không khớp");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
        return ApiResponse.buildOkResponse(null, "Đổi mật khẩu thành công");
    }

    @Transactional
    @Override
    public ApiResponse<UserResponse> changeInfo(UserRequest request) {
        return null;
    }

    @Transactional
    @Override
    public ApiResponse<Void> logout(String bearerToken) throws ParseException {
        if(bearerToken == null || !bearerToken.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Token không hợp lệ");
        }

        String token = bearerToken.substring(7);
        SignedJWT jwt = SignedJWT.parse(token);
        InvalidatedToken invalidatedToken = new InvalidatedToken(
                jwt.getJWTClaimsSet().getJWTID(),
                DateUtils.convertToLocalDateTime(jwt.getJWTClaimsSet().getExpirationTime())
        );

        invalidatedTokenRepository.save(invalidatedToken);

        return ApiResponse.buildOkResponse(null, "Đăng xuất thành công");
    }

    @Transactional
    @Override
    public ApiResponse<AuthResponse> refreshToken(String token) throws ParseException, JOSEException {
        if(token == null || !token.startsWith("Bearer ")) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR, "Phiên đăng nhập không hợp lệ");
        }
        String oldToken = token.substring(7);
        SignedJWT signedJWT = jwtAuthenticationProvider.verifyToken(oldToken, true);
        long userId = (long) signedJWT.getJWTClaimsSet().getClaim("id");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        InvalidatedToken invalidatedToken = new InvalidatedToken();
        invalidatedToken.setId(signedJWT.getJWTClaimsSet().getJWTID());
        invalidatedToken.setExpiryTime(DateUtils.
                convertToLocalDateTime(signedJWT.getJWTClaimsSet().getExpirationTime()));

        invalidatedTokenRepository.save(invalidatedToken);

        String newToken = jwtAuthenticationProvider.generateToken(user);
        AuthResponse authResponse = new AuthResponse(newToken);
        return ApiResponse.buildOkResponse(authResponse, "Làm mới phiên đăng nhập thành công");
    }

}
