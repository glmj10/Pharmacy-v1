package com.project.pharmacy.controller;

import com.project.pharmacy.dto.request.RoleRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.RoleResponse;
import com.project.pharmacy.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {
    private final RoleService roleService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAllRoles(@RequestParam(required = false) String code,
                                                                       @RequestParam(required = false) String name) {
        ApiResponse<List<RoleResponse>> response = roleService.getAllRoles(code, name);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getRoleById(@PathVariable Long id) {
        ApiResponse<RoleResponse> response = roleService.getRoleById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> createRole(@RequestBody @Valid RoleRequest request) {
        ApiResponse<RoleResponse> response = roleService.createRole(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> updateRole(@PathVariable Long id, @RequestBody @Valid RoleRequest request) {
        ApiResponse<RoleResponse> response = roleService.updateRole(id, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

}
