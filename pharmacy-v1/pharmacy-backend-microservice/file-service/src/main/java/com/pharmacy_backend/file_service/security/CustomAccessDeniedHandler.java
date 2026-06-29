package com.pharmacy_backend.file_service.security;

import com.pharmacy_backend.common.security.BaseAccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomAccessDeniedHandler extends BaseAccessDeniedHandler {
//
//    private final ObjectMapper objectMapper = new ObjectMapper();
//
//
//    @Override
//    public void handle(HttpServletRequest request,
//                       HttpServletResponse response,
//                       AccessDeniedException accessDeniedException) throws IOException{
//        response.setStatus(HttpStatus.UNAUTHORIZED.value());
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
//
//        ErrorResponse errorResponse = ErrorResponse.builder()
//                .status(HttpStatus.UNAUTHORIZED.value())
//                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
//                .message("Không có quyền truy cập")
//                .path(request.getRequestURI())
//                .timestamp(LocalDateTime.now()).build();
//
//        objectMapper.findAndRegisterModules();
//        objectMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
//        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
//        response.setContentType(MediaType.APPLICATION_JSON_VALUE + "; charset=UTF-8");
//        response.setCharacterEncoding("UTF-8");
//        response.getWriter().write(jsonResponse);
//    }
}
