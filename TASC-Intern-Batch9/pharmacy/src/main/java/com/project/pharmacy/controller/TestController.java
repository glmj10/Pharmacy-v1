package com.project.pharmacy.controller;

import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class TestController {

    @GetMapping
    public ResponseEntity<String> api() {
        String s = "First api";
        return new ResponseEntity<>(s, HttpStatusCode.valueOf(200));
    }
}
