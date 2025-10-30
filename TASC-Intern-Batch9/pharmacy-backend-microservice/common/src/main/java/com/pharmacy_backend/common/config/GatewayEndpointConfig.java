package com.pharmacy_backend.common.config;

public class GatewayEndpointConfig {

    public static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/login",
            "/api/v1/auth/send-verification-email",
            "/api/v1/auth/verify",
            "/api/v1/auth/register",
            "/api/v1/auth/forgot-password",
            "/api/v1/auth/reset-password",
            "/api/v1/auth/refresh-token",
            "/api/v1/payments/test",

            "/api/v1/brands/customer/public/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",

    };

    public static final String[] PUBLIC_GET_ENDPOINTS = {
            "/api/v1/products",
            "/api/v1/products/slug/{slug}",
            "/api/v1/products/rank/suggestions/top15",
            "/api/v1/categories/**",
            "/api/v1/products/brand/suggestions/top15",
            "/api/v1/brands/customer/public",
            "/api/v1/blogs",
            "/api/v1/blogs/{slug}",
            "/api/v1/categories/parent/{parentSlug}",
            "/api/v1/categories",
            "/api/v1/files/download/{uuid}",
            "/api/v1/blogs",
            "/api/v1/blogs/slug/{slug}",
    };

    public static final String[] PUBLIC_POST_ENDPOINTS = {
            "/api/v1/contacts",
    };
}
