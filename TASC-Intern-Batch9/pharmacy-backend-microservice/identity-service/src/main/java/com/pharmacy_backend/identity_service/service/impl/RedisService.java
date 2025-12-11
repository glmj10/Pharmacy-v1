package com.pharmacy_backend.identity_service.service.impl;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    public void storeInvalidatedToken(String jti, long expirationTime) {
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.INVALIDATED_JWT.getKey()
                + ":" + jti, "invalid", expirationTime, TimeUnit.SECONDS);
        log.info("Stored invalidated jti in Redis: {}", jti);
    }

    public boolean isTokenInvalidated(String jti) {
        Boolean exists = redisTemplate.hasKey(RedisKeyTypeEnum.INVALIDATED_JWT.getKey()
                + ":" + jti);
        log.info("Checked if token is invalidated in Redis: {} - {}", jti, exists);
        return exists;
    }

    public void storeResetPasswordToken(String jti, long expirationTime) {
        long expirationMillis = expirationTime - new Date().getTime();
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.RESET_PASSWORD_TOKEN.getKey()
                + ":" + jti, "true", expirationMillis, TimeUnit.MILLISECONDS);
        log.info("Stored reset password token in Redis: {}", jti);
    }

    public boolean isResetPasswordTokenValid(String jti) {
        Boolean exists = redisTemplate.hasKey(RedisKeyTypeEnum.RESET_PASSWORD_TOKEN.getKey()
                + ":" + jti);
        log.info("Checked if reset password token is valid in Redis: {} - {}", jti, exists);
        return exists;
    }

    public boolean getResetPasswordTokenStatus(String jti) {
        Object status = redisTemplate.opsForValue().get(RedisKeyTypeEnum.RESET_PASSWORD_TOKEN.getKey()
                + ":" + jti);
        log.info("Retrieved reset password token status from Redis: {} - {}", jti, status);
        return status != null && Boolean.parseBoolean(status.toString());
    }

    public void removeResetPasswordToken(String jti) {
        redisTemplate.delete(RedisKeyTypeEnum.RESET_PASSWORD_TOKEN.getKey()
                + ":" + jti);
        log.info("Removed reset password token from Redis: {}", jti);
    }

    public void storeVerificationToken(String jti, long expirationTime) {
        long expirationMillis = expirationTime - new Date().getTime();
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.VERIFICATION_TOKEN.getKey()
                + ":" + jti, "true", expirationMillis, TimeUnit.MILLISECONDS);
        log.info("Stored verification token in Redis: {}", jti);
    }

    public boolean isVerificationTokenValid(String jti) {
        Boolean exists = redisTemplate.hasKey(RedisKeyTypeEnum.VERIFICATION_TOKEN.getKey()
                + ":" + jti);
        log.info("Checked if verification token is valid in Redis: {} - {}", jti, exists);
        return exists;
    }

    public boolean getVerificationTokenStatus(String jti) {
        Object status = redisTemplate.opsForValue().get(RedisKeyTypeEnum.VERIFICATION_TOKEN.getKey()
                + ":" + jti);
        log.info("Retrieved verification token status from Redis: {} - {}", jti, status);
        return status != null && (Boolean) status;
    }

    public void removeVerificationToken(String jti) {
        redisTemplate.delete(RedisKeyTypeEnum.VERIFICATION_TOKEN.getKey()
                + ":" + jti);
        log.info("Removed verification token from Redis: {}", jti);
    }

    public void storeUserVersion(Long userId, Integer version) {
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.USER_VERSION.getKey()
                + ":" + userId, version.toString(), 1, TimeUnit.DAYS);
        log.info("Stored user version in Redis: {} - {}", userId, version);
    }

    public Integer getUserVersion(Long userId) {
        Object version = redisTemplate.opsForValue().get(RedisKeyTypeEnum.USER_VERSION.getKey()
                + ":" + userId);
        log.info("Retrieved user version from Redis: {} - {}", userId, version);
        return version != null ? Integer.parseInt(version.toString()) : null;
    }

    public void storeResetPasswordOtp(Long userId, String otp) {
        redisTemplate.opsForValue().set(RedisKeyTypeEnum.RESET_PASSWORD_OTP.getKey()
                + ":" + userId, otp, RedisKeyTypeEnum.RESET_PASSWORD_OTP.getDuration(), TimeUnit.SECONDS);
        log.info("Stored reset password OTP in Redis: {} - {}", userId, otp);
    }

    public boolean isResetPasswordOtpValid(Long userId, String otp) {
        Object storedOtp = redisTemplate.opsForValue().get(RedisKeyTypeEnum.RESET_PASSWORD_OTP.getKey()
                + ":" + userId);
        boolean isValid = storedOtp != null && storedOtp.toString().equals(otp);
        log.info("Checked if reset password OTP is valid in Redis: {} - {} - {}", userId, otp, isValid);
        return isValid;
    }

    public boolean removeResetPasswordOtp(Long userId) {
        Boolean existed = redisTemplate.delete(RedisKeyTypeEnum.RESET_PASSWORD_OTP.getKey()
                + ":" + userId);
        log.info("Removed reset password OTP from Redis: {} - {}", userId, existed);
        return existed != null && existed;
    }

    public boolean storeOtp(Long userId, String otp, RedisKeyTypeEnum type) {
        String key = type.getKey() + ":" + userId;
        Boolean exists = redisTemplate.hasKey(key);
        if (exists != null && exists) {
            log.info("OTP already exists in Redis: {} - {}", userId, type);
            return false;
        }
        redisTemplate.opsForValue().set(key, otp, type.getDuration(), TimeUnit.SECONDS);
        log.info("Stored OTP in Redis: {} - {} - {}", userId, otp, type);
        return true;
    }

    public boolean isOtpValid(Long userId, String otp, RedisKeyTypeEnum type) {
        String key = type.getKey() + ":" + userId;
        Object storedOtp = redisTemplate.opsForValue().get(key);
        boolean isValid = storedOtp != null && storedOtp.toString().equals(otp);
        return isValid;
    }

    public void removeOtp(Long userId, RedisKeyTypeEnum type) {
        String key = type.getKey() + ":" + userId;
        redisTemplate.delete(key);
        log.info("Removed OTP from Redis: {} - {}", userId, type);
    }

    public void storeUserClick(Long userId) {
        String key = String.format("%s:%d", RedisKeyTypeEnum.USER_CLICK.name(), userId);
        redisTemplate.opsForValue().set(key, "clicked", RedisKeyTypeEnum.USER_CLICK.getDuration(), TimeUnit.SECONDS);
        log.info("Stored user click in Redis: {}", userId);
    }

    public boolean isUserClickValid(Long userId) {
        String key = String.format("%s:%d", RedisKeyTypeEnum.USER_CLICK.name(), userId);
        Boolean exists = redisTemplate.hasKey(key);
        log.info("Checked if user click is valid in Redis: {} - {}", userId, exists);
        return exists != null && exists;
    }
}

