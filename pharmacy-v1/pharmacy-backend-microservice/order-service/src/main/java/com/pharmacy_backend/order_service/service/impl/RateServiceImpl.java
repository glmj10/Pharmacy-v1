package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.order_service.config.AppConfig;
import com.pharmacy_backend.order_service.dto.request.RateRequest;
import com.pharmacy_backend.order_service.dto.response.RateResponse;
import com.pharmacy_backend.order_service.dto.response.UserResponse;
import com.pharmacy_backend.order_service.entity.*;
import com.pharmacy_backend.order_service.mapper.RateMapper;
import com.pharmacy_backend.order_service.mapper.UserMapper;
import com.pharmacy_backend.order_service.repository.*;
import com.pharmacy_backend.order_service.service.RateService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class RateServiceImpl implements RateService {
    private final RateRepository rateRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final RateMapper rateMapper;
    private final UserMapper userMapper;
    private final ProductRepository productRepository;

    @Override
    public ApiResponse<PageResponse<List<RateResponse>>> getRatesByProductId(Long productId, Integer pageIndex, Integer pageSize, Integer rating) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Rate> ratesPage = rateRepository.findAllByProductId(productId, pageable);
        List<RateResponse> rateResponses = ratesPage.getContent().stream().map(
                rate -> {
                    RateResponse response = rateMapper.toRateResponse(rate);
                    User user = userRepository.findById(rate.getUser().getId()).orElse(null);
                    UserResponse userResponse = userMapper.toUserResponse(user);
                    userResponse.setProfilePicUrl(AppConfig.getImagePrefix() + userResponse.getProfilePicUrl());
                    response.setUserResponse(userResponse);
                    return response;
                }
        ).toList();

        PageResponse<List<RateResponse>> response = PageResponse.<List<RateResponse>>builder()
                .content(rateResponses)
                .currentPage(pageIndex)
                .totalElements(ratesPage.getTotalElements())
                .totalPages(ratesPage.getTotalPages())
                .hasNext(ratesPage.hasNext())
                .hasPrevious(ratesPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(response, "Lấy danh sách đánh giá sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> createRate(RateRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        OrderDetail orderDetail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND));
        if(Boolean.TRUE.equals(orderDetail.getRated())) {
            throw new CustomException(ErrorCode.ORDER_DETAIL_ALREADY_RATED);
        }

        Product product = productRepository.findById(orderDetail.getProduct().getId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        Order order = orderRepository.findById(orderDetail.getOrder().getId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));

        if(!order.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        if(order.getStatus() != OrderStatusEnum.DELIVERED) {
            throw new CustomException(ErrorCode.CANNOT_RATE_UNDELIVERED_ORDER);
        }

        orderDetail.setRated(true);

        Rate rate = rateMapper.toRate(request);
        rate.setUser(user);
        rate.setProductId(product.getId());

        orderDetailRepository.save(orderDetail);
        rateRepository.save(rate);
        return ApiResponse.buildCreatedResponse(null, "Đánh giá sản phẩm thành công");
    }
}
