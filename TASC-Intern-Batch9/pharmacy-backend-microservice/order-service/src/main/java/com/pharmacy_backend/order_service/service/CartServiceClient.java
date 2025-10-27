package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.order_service.config.FeignClientConfig;
import com.pharmacy_backend.order_service.dto.response.CartResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "cart-service", configuration = FeignClientConfig.class)
public interface CartServiceClient {
    @GetMapping("/carts/item/checkout")
    ApiResponse<CartResponse> getCartItemToCheckout();
}
