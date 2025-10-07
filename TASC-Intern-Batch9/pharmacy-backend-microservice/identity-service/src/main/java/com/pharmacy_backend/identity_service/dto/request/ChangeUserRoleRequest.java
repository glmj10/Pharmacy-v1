package com.pharmacy_backend.identity_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class ChangeUserRoleRequest {
    @NotEmpty(message = "Mã quyền không được để trống")
    private Set<String> roleCodes = new HashSet<>();
}
