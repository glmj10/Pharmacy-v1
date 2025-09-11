package com.project.pharmacy.service.impl;

import com.nimbusds.jwt.SignedJWT;
import com.project.pharmacy.entity.InvalidatedToken;
import com.project.pharmacy.entity.PasswordResetToken;
import com.project.pharmacy.repository.InvalidatedTokenRepository;
import com.project.pharmacy.repository.PasswordResetTokenRepository;
import com.project.pharmacy.service.JWTBlacklistService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Service
@Slf4j
public class JWTBlacklistServiceImpl implements JWTBlacklistService {

    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;


    public JWTBlacklistServiceImpl(InvalidatedTokenRepository invalidatedTokenRepository, PasswordResetTokenRepository passwordResetTokenRepository) {
        this.invalidatedTokenRepository = invalidatedTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }


    @Scheduled(cron = "0 0 * * * *")
    public void cleanUpExpiredTokens() {
        List<InvalidatedToken> expiredTokens = invalidatedTokenRepository
                .findTop10ByExpiryTimeBefore(LocalDateTime.now());
        if (!expiredTokens.isEmpty()) {
            invalidatedTokenRepository.deleteAll(expiredTokens);
        }
        log.info("Cleaned up {} expired tokens", expiredTokens.size());
    }

    @Scheduled(cron = "0 0 * * * *")
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
        return jti != null && invalidatedTokenRepository.existsById(jti);
    }

    @Override
    public boolean isTokenExpired(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getExpirationTime().before(new java.util.Date());
    }

    @Override
    public boolean isTokenVersionHasUpdated(String token, Integer version) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);

        Integer tokenVersion = Integer.parseInt(signedJWT.getJWTClaimsSet().getClaim("ver").toString());
        if(!tokenVersion.equals(version)) {
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date date = signedJWT.getJWTClaimsSet().getExpirationTime();
            LocalDateTime localDateTime = date.toInstant()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
            invalidatedTokenRepository.save(new InvalidatedToken(jti, localDateTime));
            return true;
        }

        return false;
    }
}
