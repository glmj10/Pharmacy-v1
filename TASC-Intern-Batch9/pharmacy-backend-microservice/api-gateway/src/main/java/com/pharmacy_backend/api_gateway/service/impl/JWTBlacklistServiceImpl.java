package com.pharmacy_backend.api_gateway.service.impl;

import com.nimbusds.jwt.SignedJWT;
import com.pharmacy_backend.api_gateway.service.JWTBlacklistService;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.Date;

@Service
@Slf4j
@RequiredArgsConstructor
public class JWTBlacklistServiceImpl implements JWTBlacklistService {
    private final RedisService redisTokenService;

    @Override
    public boolean isTokenInvalidated(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        String jti = signedJWT.getJWTClaimsSet().getJWTID();
        if (jti == null) return false;
        Object obj = redisTokenService.getValue(RedisKeyTypeEnum.INVALIDATED_JWT.name() + ":" + jti);
        return obj != null;
    }

    @Override
    public boolean isTokenExpired(String token) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date());
    }

    @Override
    @Transactional
    public boolean isTokenVersionHasUpdated(String token, Integer version) throws ParseException {
        SignedJWT signedJWT = SignedJWT.parse(token);

        Integer tokenVersion = Integer.parseInt(signedJWT.getJWTClaimsSet().getClaim("ver").toString());
        if(!tokenVersion.equals(version)) {
            String jti = signedJWT.getJWTClaimsSet().getJWTID();
            Date date = signedJWT.getJWTClaimsSet().getExpirationTime();
            LocalDateTime localDateTime = date.toInstant()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
//            invalidatedTokenRepository.insertIgnore(jti, localDateTime);
            return true;
        }

        return false;
    }
}
