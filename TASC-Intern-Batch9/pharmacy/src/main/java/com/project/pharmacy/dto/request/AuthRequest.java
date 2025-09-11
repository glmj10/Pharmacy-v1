package com.project.pharmacy.dto.request;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class AuthRequest {
    @Email(message = "email không đúng định dạng")
    @NotEmpty(message = "email không được để trống")
    String email;

    @NotEmpty(message = "mật khẩu không được để trống")
    String password;
}
