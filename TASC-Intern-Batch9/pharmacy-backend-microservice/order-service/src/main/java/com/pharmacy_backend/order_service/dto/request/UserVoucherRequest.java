package com.pharmacy_backend.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVoucherRequest {
    @NotNull(message = "Mã voucher không được để trống")
    Long voucherId;
}