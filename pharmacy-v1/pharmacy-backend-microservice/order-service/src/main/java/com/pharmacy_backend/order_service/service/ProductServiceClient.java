package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import com.pharmacy_backend.order_service.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "product-service", configuration = FeignClientConfig.class)
public interface ProductServiceClient {

    @PostMapping("/reservations/reserve")
    ApiResponse<ReserveResponse> reserveProduct(@RequestBody List<ReserveRequest> reserveRequestList);

    @PutMapping("/reservations/release")
    ApiResponse<Void> releaseProduct(@RequestBody List<ReserveRequest> reserveRequestList);
}
