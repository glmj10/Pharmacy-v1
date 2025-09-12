package com.project.pharmacy.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WishlistRequest {
    @NotNull(message = "Mã sản phẩm không được để trống")
    private Long productId;
}
