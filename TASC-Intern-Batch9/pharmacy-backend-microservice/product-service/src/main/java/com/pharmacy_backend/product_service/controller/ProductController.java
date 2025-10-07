package com.pharmacy_backend.product_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ProductController {

    @GetMapping
    public ResponseEntity<String> testEndpoint() {
        return ResponseEntity.ok("Product Service is up and running!");
    }
}
