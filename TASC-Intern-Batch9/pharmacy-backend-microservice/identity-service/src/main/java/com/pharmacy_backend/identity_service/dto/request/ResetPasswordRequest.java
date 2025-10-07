package com.pharmacy_backend.identity_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResetPasswordRequest {
    @NotEmpty(message = "Reset token không được để trống")
    private String resetToken;

    @NotEmpty(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu mới phải có ít nhất 6 ký tự")
    private String password;

    @NotEmpty(message = "Mật khẩu xác nhận không được để trống")
    private String confirmPassword;
}
