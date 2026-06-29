package com.pharmacy_backend.identity_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerifyAccountRequest {
    @NotEmpty(message = "Email không được để trống")
    private String email;
    @NotEmpty(message = "OTP không được để trống")
    private String otp;
}
