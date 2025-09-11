package com.project.pharmacy.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChangePasswordRequest {
    @NotEmpty(message = "Mật khẩu cũ không được để trống" )
    private String oldPassword;

    @NotEmpty(message = "Mật khẩu mới không được để trống")
    private String password;

    @NotEmpty(message = "Mật khẩu xác nhận không được để trống")
    private String confirmPassword;
}
