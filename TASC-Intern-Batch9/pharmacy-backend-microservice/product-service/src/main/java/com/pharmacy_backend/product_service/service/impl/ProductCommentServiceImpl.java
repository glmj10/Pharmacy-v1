package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.request.CommentRequest;
import com.pharmacy_backend.product_service.dto.response.CommentResponse;
import com.pharmacy_backend.product_service.repository.CommentRepository;
import com.pharmacy_backend.product_service.service.ProductCommentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCommentServiceImpl implements ProductCommentService {
    final CommentRepository commentRepository;

    @Override
    public ApiResponse<Void> comment(CommentRequest request) {
        return null;
    }

    @Override
    public ApiResponse<Void> replyComment(CommentRequest request) {
        return null;
    }

    @Override
    public PageResponse<List<ApiResponse<CommentResponse>>> getCommentsByProductId(Long productId,
                                                                                   Integer pageIndex,
                                                                                   Integer pageSize) {
        return null;
    }
}
