package com.pharmacy_backend.identity_service.security;

import com.pharmacy_backend.common.security.BaseAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationEntryPoint extends BaseAuthenticationEntryPoint {

//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//    @Override
//    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
//            throws IOException {
//
//        response.setStatus(HttpStatus.UNAUTHORIZED.value());
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//
//        ErrorResponse errorResponse = ErrorResponse.builder()
//                .status(HttpStatus.UNAUTHORIZED.value())
//                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
//                .message("Truy cập trái phép - vui lòng đăng nhập hoặc cung cấp thông tin đăng nhập hợp lệ.")
//                .path(request.getRequestURI())
//                .timestamp(LocalDateTime.now())
//                .errorCode(ErrorCode.UNAUTHORIZED.toString())
//                .build();
//
//        objectMapper.findAndRegisterModules();
//        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8");
//        response.setCharacterEncoding("UTF-8");
//        response.getWriter().write(jsonResponse);
//
//    }
}


