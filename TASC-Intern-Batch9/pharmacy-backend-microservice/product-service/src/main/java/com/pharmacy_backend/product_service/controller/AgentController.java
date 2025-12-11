package com.pharmacy_backend.product_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.AgentMessageRequest;
import com.pharmacy_backend.product_service.dto.response.AgentResponse;
import com.pharmacy_backend.product_service.service.AgentService;
import com.pharmacy_backend.product_service.service.impl.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/agents")
public class AgentController {
    private final AgentService agentService;
    private final GeminiService geminiService;

    @PostMapping("/setup")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> setUpAgent() {
        ApiResponse<String> response = geminiService.syncVectors();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AgentResponse>> askAgent(@RequestBody AgentMessageRequest request) {
        ApiResponse<AgentResponse> response = agentService.generateResponse(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
