package com.project.pharmacy.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class RoleRequest {
    @NotEmpty(message = "Mã quyền không được để trống")
    private String code;
    @NotEmpty(message = "Tên quyền không được để trống")
    private String name;

    @NotEmpty(message = "Mô tả quyền không được để trống")
    private String description;
}
