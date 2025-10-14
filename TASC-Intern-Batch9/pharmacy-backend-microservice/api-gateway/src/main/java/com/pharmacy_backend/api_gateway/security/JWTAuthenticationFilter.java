package com.pharmacy_backend.api_gateway.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nimbusds.jwt.SignedJWT;
import com.pharmacy_backend.api_gateway.service.JWTBlacklistService;
import com.pharmacy_backend.common.dto.response.ErrorResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.text.ParseException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JWTAuthenticationFilter implements WebFilter {

    private final JWTBlacklistService jwtBlacklistService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @NonNull
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, @NonNull WebFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        if (shouldNotFilter(path)) {
            return chain.filter(exchange);
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7).trim();
            try {
                if (jwtBlacklistService.isTokenInvalidated(token)) {
                    return handleUnauthorized(exchange, "Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi");
                }

                if (jwtBlacklistService.isTokenExpired(token)) {
                    return handleUnauthorized(exchange, "Phiên đăng nhập đã hết hạn");
                }

//                Long userId = Long.valueOf(signedJWT.getJWTClaimsSet().getClaim("id").toString());
//                if (jwtBlacklistService.isTokenVersionHasUpdated(token, userVersion)) {
//                    return handleUnauthorized(exchange, "Phiên đăng nhập đã được cập nhật, vui lòng đăng nhập lại.");
//                }

            } catch (ParseException e) {
                return handleUnauthorized(exchange, "Token định dạng không hợp lệ");
            }
        }

        return chain.filter(exchange);
    }

    private Mono<Void> handleUnauthorized(ServerWebExchange exchange, String message) {
        var response = exchange.getResponse();
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(message)
                .timestamp(LocalDateTime.now())
                .errorCode(ErrorCode.UNAUTHORIZED.toString())
                .build();

        try {
            objectMapper.findAndRegisterModules();
            objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
            byte[] bytes = objectMapper.writeValueAsBytes(errorResponse);
            var buffer = response.bufferFactory().wrap(bytes);
            return response.writeWith(Mono.just(buffer));
        } catch (Exception e) {
            return response.setComplete();
        }
    }

    private boolean shouldNotFilter(String path) {
        return path.startsWith("/api/auth/")
                || path.startsWith("/api/public/")
                || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/h2-console");
    }
}

