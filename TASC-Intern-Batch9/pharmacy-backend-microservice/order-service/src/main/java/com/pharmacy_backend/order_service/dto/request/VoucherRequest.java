package com.pharmacy_backend.order_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VoucherRequest {
    @NotEmpty(message = "Mã voucher không được để trống")
    String code;

    @NotEmpty(message = "Mô tả voucher không được để trống")
    String description;

    @NotEmpty(message = "Loại giảm giá không được để trống")
    String discountType;

    @NotNull(message = "Loại voucher không được để trống")
    String type;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    Integer discountValue;

    @NotNull(message = "Số tiền giảm giá tối đa không được để trống")
    Integer maxDiscountAmount;

    @NotNull(message = "Giá trị đơn hàng tối thiểu không được để trống")
    Integer minOrderValue;

    @NotNull(message = "Giới hạn sử dụng không được để trống")
    Integer usageLimit;

    @NotNull(message = "Giới hạn sử dụng cho mỗi người dùng không được để trống")
    Integer usageLimitPerUser;

    String status;

    LocalDateTime startDate;
    LocalDateTime endDate;
}
