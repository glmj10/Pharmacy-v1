package com.pharmacy_backend.identity_service.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RegistrationRequest {
    @NotEmpty(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    String email;

    @Size(min = 3, message = "Tên đăng nhập phải có ít nhất 3 ký tự")
    @NotEmpty(message = "Tên đăng nhập không được để trống")
    String username;

    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    @NotEmpty(message = "Mật khẩu không được để trống")
    String password;

    @NotEmpty(message = "Mật khẩu xác nhận không được để trống")
    String confirmPassword;
}
