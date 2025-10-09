package com.project.pharmacy.service.impl;

import com.nimbusds.jwt.SignedJWT;
import com.project.pharmacy.entity.PasswordResetToken;
import com.project.pharmacy.repository.InvalidatedTokenRepository;
import com.project.pharmacy.repository.PasswordResetTokenRepository;
import com.project.pharmacy.service.JWTBlacklistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class JWTBlacklistServiceImpl implements JWTBlacklistService {

//    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final RedisService redisService;

//    @Scheduled(cron = "0 0 * * * *")
//    @Transactional
//    public void cleanUpExpiredTokens() {
//        List<InvalidatedToken> expiredTokens = invalidatedTokenRepository
//                .findTop10ByExpiryTimeBefore(LocalDateTime.now());
//        if (!expiredTokens.isEmpty()) {
//            invalidatedTokenRepository.deleteAll(expiredTokens);
//        }
//        log.info("Cleaned up {} expired tokens", expiredTokens.size());
//    }

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void cleanUpPasswordResetTokens() {
        LocalDateTime now = LocalDateTime.now();
        List<PasswordResetToken> expiredTokens = passwordResetTokenRepository.findTop10ByExpiryAtBefore(now);
        if (!expiredTokens.isEmpty()) {
            passwordResetTokenRepository.deleteAll(expiredTokens);
        }
        log.info("Cleaned up {} expired password reset tokens", expiredTokens.size());
    }

    @Override
    public boolean isTokenInvalidated(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        String jti = signedJWT.getJWTClaimsSet().getJWTID();
        return jti != null && redisService.isTokenInvalidated(jti);
    }


    @Override
    public boolean isTokenExpired(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getExpirationTime().before(new java.util.Date());
    }

    @Override
    @Transactional
    public boolean isTokenVersionHasUpdated(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);

        Integer tokenVersion = Integer.parseInt(signedJWT.getJWTClaimsSet().getClaim("ver").toString());
        Integer version = redisService.getUserVersion(
                Long.valueOf(signedJWT.getJWTClaimsSet().getClaim("id").toString())
        );

        if(version != null && !tokenVersion.equals(version)) {
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            long exp = signedJWT.getJWTClaimsSet().getExpirationTime().getTime();
            redisService.storeInvalidatedToken(jti, exp);
            return true;
        }

        return false;
    }
}
