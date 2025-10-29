package com.pharmacy.payment_service.service;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "product-service")
public interface ProductServiceClient {

    @PostMapping("/reservations/reserve")
    ApiResponse<ReserveResponse> reserveProduct(@RequestBody List<ReserveRequest> reserveRequestList);
}
