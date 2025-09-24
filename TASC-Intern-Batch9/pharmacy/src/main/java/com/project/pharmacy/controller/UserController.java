package com.project.pharmacy.controller;

import com.project.pharmacy.dto.request.ChangeUserRoleRequest;
import com.project.pharmacy.dto.request.UserSearchCriteria;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.dto.response.UserResponse;
import com.project.pharmacy.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {
    private final UserService userService;

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/statistic/total")
    public ResponseEntity<ApiResponse<Long>> getTotalUser() {
        ApiResponse<Long> response = userService.getTotalUser();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<UserResponse>>>> getAllUsers(
            @RequestParam(defaultValue = "1") Integer pageIndex,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @ModelAttribute UserSearchCriteria criteria) {
        ApiResponse<PageResponse<List<UserResponse>>> response = userService.getAllUsers(pageIndex, pageSize, criteria);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/role/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> changeUserRole(
            @PathVariable Long userId,
            @RequestBody @Valid ChangeUserRoleRequest request) {
        ApiResponse<UserResponse> response = userService.changeUserRole(userId, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long userId) {
        ApiResponse<UserResponse> response = userService.getUserById(userId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(@PathVariable Long userId, @RequestBody @Valid ChangeUserRoleRequest request) {
        ApiResponse<UserResponse> response = userService.changeUserRole(userId, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        ApiResponse<UserResponse> response = userService.getCurrentUser();
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
