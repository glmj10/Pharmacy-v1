package com.pharmacy_backend.user_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.user_service.dto.request.ProfileRequest;
import com.pharmacy_backend.user_service.dto.response.ProfileResponse;
import com.pharmacy_backend.user_service.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/profiles")
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<List<ProfileResponse>>>  getUserProfiles() {
        ApiResponse<List<ProfileResponse>> response = profileService.getUserProfiles();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileById(@PathVariable Long id) {
        ApiResponse<ProfileResponse> response = profileService.getProfileById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(@RequestBody @Valid ProfileRequest request) {
        ApiResponse<ProfileResponse> response = profileService.createProfile(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(@PathVariable Long id, @RequestBody @Valid ProfileRequest request) {
        ApiResponse<ProfileResponse> response = profileService.updateProfile(id, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(@PathVariable Long id) {
        ApiResponse<Void> response = profileService.deleteProfile(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
