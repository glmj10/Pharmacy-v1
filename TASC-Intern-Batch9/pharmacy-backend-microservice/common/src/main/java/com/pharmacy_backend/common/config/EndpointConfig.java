package com.pharmacy_backend.common.config;

public class EndpointConfig {
    public static final String[] PUBLIC_ENDPOINTS = {
            "/auth/login",
            "/auth/send-verification-email",
            "/auth/verify",
            "/auth/register",
            "/auth/forgot-password",
            "/auth/reset-password",
            "/auth/refresh-token",

            "/api/v1/brands/customer/public/**",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger-ui.html",

    };

    public static final String[] PUBLIC_GET_ENDPOINTS = {
            "/products",
            "/products/slug/{slug}",
            "/products/rank/suggestions/top15",
            "/categories/**",
            "/products/brand/suggestions/top15",
            "/brands/customer/public",
            "/blogs",
            "/blogs/{slug}",
            "/categories/parent/{parentSlug}",
            "/categories",
            "/files/download/{uuid}",
            "/blogs",
            "/blogs/slug/{slug}",
    };

    public static final String[] PUBLIC_POST_ENDPOINTS = {
            "/contacts",
    };
}
