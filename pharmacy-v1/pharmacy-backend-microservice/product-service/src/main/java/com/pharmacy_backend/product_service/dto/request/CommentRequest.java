package com.pharmacy_backend.product_service.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequest {
    @NotEmpty(message = "Nội dung bình luận không được để trống")
    private String content;

    @NotNull(message = "Mã sản phẩm không được để trống")
    private Integer productId;
    private Integer parentCommentId;
}
