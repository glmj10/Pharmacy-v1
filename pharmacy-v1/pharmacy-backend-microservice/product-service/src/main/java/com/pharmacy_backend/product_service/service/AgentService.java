package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.AgentMessageRequest;
import com.pharmacy_backend.product_service.dto.response.AgentResponse;

public interface AgentService {
    ApiResponse<AgentResponse> generateResponse(AgentMessageRequest request);
}
