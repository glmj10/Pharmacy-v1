package com.project.pharmacy.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.nimbusds.jwt.SignedJWT;
import com.project.pharmacy.dto.response.ErrorResponse;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.service.JWTBlacklistService;
import com.project.pharmacy.service.impl.RedisTokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.text.ParseException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JWTAuthenticationFilter extends OncePerRequestFilter {

    private final JWTBlacklistService jwtBlacklistService;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                SignedJWT signedJWT = SignedJWT.parse(token);
                if (jwtBlacklistService.isTokenInvalidated(token)) {
                    handleUnauthorized(response, "Phiên đăng nhập không hợp lệ hoặc đã bị thu hồi");
                    return;
                }

                if(jwtBlacklistService.isTokenExpired(token)) {
                    handleUnauthorized(response, "Phiên đăng nhập đã hết hạn");
                    return;
                }

                User user = userRepository.findById(Long.valueOf(
                        signedJWT.getJWTClaimsSet()
                        .getClaim("id").toString())
                ).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

                if(jwtBlacklistService.isTokenVersionHasUpdated(token, user.getTokenVersion())) {
                    handleUnauthorized(response, "Phiên đăng nhập đã được câp nhật. Vui lòng đăng nhập lại.");
                    return;
                }
            } catch (ParseException e) {
                handleUnauthorized(response, e.getMessage());
                return;
            }
        }
        filterChain.doFilter(request, response);
    }

    private void handleUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(message)
                .timestamp(LocalDateTime.now())
                .errorCode(ErrorCode.UNAUTHORIZED.toString())
                .build();

        objectMapper.findAndRegisterModules();
        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || path.startsWith("/api/public/") || path.startsWith("/swagger")
                || path.startsWith("/v3/api-docs") || path.startsWith("/h2-console");
    }
}
