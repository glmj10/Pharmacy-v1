package com.pharmacy_backend.identity_service.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.exceptions.AuthenticationException;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.service.RedisService;
import com.pharmacy_backend.common.utils.DateUtils;
import com.pharmacy_backend.identity_service.entity.Role;
import com.pharmacy_backend.identity_service.entity.User;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
@RequiredArgsConstructor
public class JWTAuthenticationProvider {

    @Value("${jwt.secret}")
    String secret;

    @Value("${jwt.expiration}")
    long expiration;

    @Value("${jwt.refresh.expiration}")
    long refreshExpiration;

    @Value("${jwt.reset-password.expiration}")
    Long resetPasswordExpiration;

    @Value("${jwt.verify.expiration}")
    Long verifyTime;

    static final String ISSUER = "Pharmacy";

    private final RedisService redisTokenService;

    public String generateToken(com.pharmacy_backend.identity_service.entity.User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        List<String> authorities = user.getRoles().stream().map(
                Role::getCode
        ).collect(Collectors.toList());

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject(user.getUsername())
                .claim("authorities", authorities)
                .claim("email", user.getEmail())
                .claim("id", user.getId())
                .claim("ver", user.getTokenVersion())
                .issueTime(new Date())
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(new Date(System.currentTimeMillis() + expiration * 1000))
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
        } catch (JOSEException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi tạo token");
        }
        return jwsObject.serialize();
    }

    public SignedJWT verifyToken(String token, boolean isRefreshToken) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(secret.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);
        Date expirationTime = isRefreshToken
                ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().getTime() + refreshExpiration * 1000)
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        boolean verified = signedJWT.verify(verifier);

        if (redisTokenService.getValue(RedisKeyTypeEnum.INVALIDATED_JWT.name()
                + ":" + signedJWT.getJWTClaimsSet().getJWTID()) != null) {
            throw new AuthenticationException("Phiên đăng nhập đã bị vô hiệu hóa");
        }

        if(!verified) {
            throw new AuthenticationException("Phiên đăng nhập không hợp lệ");
        }

        if(expirationTime == null || expirationTime.before(new Date())) {
            throw new AuthenticationException("Phiên đăng nhập đã hết hạn");
        }
        return signedJWT;
    }

    public String generateVerificationToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject(user.getUsername())
                .claim("email", user.getEmail())
                .claim("id", user.getId())
                .issueTime(new Date())
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(new Date(System.currentTimeMillis() + verifyTime * 1000))
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
        } catch (JOSEException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi tạo token");
        }
        return jwsObject.serialize();
    }

    public String generatePasswordResetToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                .issuer(ISSUER)
                .subject(user.getUsername())
                .claim("email", user.getEmail())
                .claim("id", user.getId())
                .issueTime(new Date())
                .jwtID(UUID.randomUUID().toString())
                .expirationTime(new Date(System.currentTimeMillis() + resetPasswordExpiration * 1000))
                .build();

        Payload payload = new Payload(claimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
        } catch (JOSEException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi tạo token");
        }
        return jwsObject.serialize();
    }

    public LocalDateTime getTokenExpiry(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime != null) {
                return DateUtils.convertToLocalDateTime(expirationTime);
            } else {
                throw new CustomException(ErrorCode.INVALID_TOKEN, "Token không có thời gian hết hạn");
            }
        } catch (ParseException e) {
            throw new CustomException(ErrorCode.INVALID_TOKEN, "Token không hợp lệ");
        }
    }

    public String getTokenJTI(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getJWTID();
    }

    public String getUserEmail(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getStringClaim("email");
    }

}
