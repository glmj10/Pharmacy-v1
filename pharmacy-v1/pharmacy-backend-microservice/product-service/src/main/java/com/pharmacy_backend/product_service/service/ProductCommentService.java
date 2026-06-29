package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.CommentRequest;
import com.pharmacy_backend.product_service.dto.response.CommentResponse;

import java.util.List;

public interface ProductCommentService {
    ApiResponse<Void> comment(CommentRequest request);
    ApiResponse<Void> replyComment(CommentRequest request);
    PageResponse<List<ApiResponse<CommentResponse>>> getCommentsByProductId(Long productId,
                                                                            Integer pageIndex,
                                                                            Integer pageSize);
}
