package com.pharmacy_backend.order_service.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.common.enums.PaymentMethodEnum;
import com.pharmacy_backend.common.enums.PaymentStatusEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.order_service.dto.request.OrderFilterRequest;
import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.OrderDetailResponse;
import com.pharmacy_backend.order_service.dto.response.OrderResponse;
import com.pharmacy_backend.order_service.dto.response.ProductResponse;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.OrderDetail;
import com.pharmacy_backend.order_service.entity.Profile;
import com.pharmacy_backend.order_service.entity.User;
import com.pharmacy_backend.order_service.mapper.OrderMapper;
import com.pharmacy_backend.order_service.mapper.ProductMapper;
import com.pharmacy_backend.order_service.repository.OrderDetailRepository;
import com.pharmacy_backend.order_service.repository.OrderRepository;
import com.pharmacy_backend.order_service.repository.ProfileRepository;
import com.pharmacy_backend.order_service.repository.UserRepository;
import com.pharmacy_backend.order_service.service.OrderService;
import com.pharmacy_backend.order_service.specification.OrderSpecification;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class OrderServiceImpl implements OrderService {
    final OrderRepository orderRepository;
    final OrderMapper orderMapper;
    final UserRepository userRepository;
    final OrderDetailRepository orderDetailRepository;
    final ProfileRepository profileRepository;
    final ProductMapper productMapper;
    final RedisTemplate<String, Object> redisTemplate;
    final ObjectMapper objectMapper;

    @Value("${order.timeout.order-cancel-minutes}")
    private Integer orderCancelMinutes;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize, OrderFilterRequest filterRequest) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }

        String key = buildCacheKey(filterRequest, pageIndex, pageSize);
        Object cached = redisTemplate.opsForValue().get(key);

        if(cached != null) {
            try {
                String json = (String) cached;
                return objectMapper.readValue(json, new TypeReference<>() {
                });
            } catch (Exception e) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi đọc key từ cache");
            }
        }

        Specification<Order> orderSpecification = OrderSpecification.hasDateRange(filterRequest.getFromDate(), filterRequest.getToDate())
                .and(OrderSpecification.hasCustomerPhoneNumber(filterRequest.getCustomerPhoneNumber()))
                .and(OrderSpecification.hasOrderId(filterRequest.getId()));

        if(filterRequest.getOrderStatus() != null) {
            orderSpecification = orderSpecification.and(OrderSpecification.hasStatus(
                    OrderStatusEnum.valueOf(filterRequest.getOrderStatus().toUpperCase()).toString())
            );
        }

        if(filterRequest.getPaymentStatus() != null) {
            orderSpecification = orderSpecification.and(OrderSpecification.hasPaymentStatus(
                    PaymentStatusEnum.valueOf(filterRequest.getPaymentStatus().toUpperCase()).toString())
            );
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Order> orderPage = orderRepository.findAll(orderSpecification ,pageable);

        List<OrderResponse> orderResponses = orderPage.getContent().stream()
                .map(order -> {
                    OrderResponse response = orderMapper.toOrderResponse(order);
                    response.setPaymentStatus(order.getPaymentStatus().name());
                    return response;
                })
                .toList();

        PageResponse<List<OrderResponse>> pageResponse = PageResponse.<List<OrderResponse>>builder()
                .currentPage(pageIndex)
                .totalElements(orderPage.getTotalElements())
                .totalPages(orderPage.getTotalPages())
                .hasNext(orderPage.hasNext())
                .hasPrevious(orderPage.hasPrevious())
                .content(orderResponses)
                .build();

        ApiResponse<PageResponse<List<OrderResponse>>> apiResponse =
                ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách đơn hàng thành công");
        try {
            String json = objectMapper.writeValueAsString(apiResponse);
            redisTemplate.opsForValue().set(key, json, 30, TimeUnit.SECONDS);
        } catch (Exception e) {
            log.error("Lỗi khi lưu cache với key {}: {}", key, e.getMessage());
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi khi lưu cache");
        }

        return apiResponse;
    }

    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getMyOrders(int pageIndex, int pageSize, String status) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize, Sort.by("createdAt").descending());

        Long userId = SecurityUtils.getCurrentUserId();
        assert userId != null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + userId));

        Page<Order> orders;
        if(status != null && !status.isEmpty()) {
            OrderStatusEnum orderStatus = OrderStatusEnum.valueOf(status.toUpperCase());
            orders = orderRepository.findByUserAndStatus(user, orderStatus, pageable);
        } else {
            orders = orderRepository.findByUser(user, pageable);
        }

        List<OrderResponse> orderResponses = orders.getContent().stream()
                .map(orderMapper::toOrderResponse)
                .toList();

        PageResponse<List<OrderResponse>> pageResponse = PageResponse.<List<OrderResponse>>builder()
                .currentPage(pageIndex)
                .totalElements(orders.getTotalElements())
                .totalPages(orders.getTotalPages())
                .hasNext(orders.hasNext())
                .hasPrevious(orders.hasPrevious())
                .content(orderResponses)
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách đơn hàng của bạn thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<OrderDetailResponse>> getOrderDetail(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + orderId));
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn hàng với ID: " + orderId));

        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(orderDetail -> {
                    OrderDetailResponse response = orderMapper.toOrderDetailResponse(orderDetail);
                    ProductResponse productResponse = productMapper.toProductResponse(orderDetail.getProduct());
                    response.setProduct(productResponse);
                    return response;
                })
                .toList();

        return ApiResponse.buildOkResponse(orderDetailResponses, "Lấy chi tiết đơn hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<?> createOrder(OrderRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + SecurityUtils.getCurrentUserId()));
        Profile profile = profileRepository.findUserProfile(user.getId(), request.getProfileId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy thông tin nhận hàng với ID: " + request.getProfileId()));

        Order order = orderMapper.toOrder(request);
        order.setCustomerName(profile.getFullName());
        order.setCustomerPhoneNumber(profile.getPhoneNumber());
        order.setCustomerAddress(profile.getAddress());
        order.setUser(user);
        order.setTotalPrice(cart.getTotalPrice());

        switch (PaymentMethodEnum.valueOf(request.getPaymentMethod().toUpperCase())) {
            case VNPAY -> {
                order = orderRepository.save(order);
                createOrderDetails(order, cart);
                HttpServletRequest servletRequest = SecurityUtils.getCurrentHttpServletRequest();
                String paymentUrl = vnPayService.createPaymentUrl(order, servletRequest);
                return ApiResponse.buildOkResponse(paymentUrl, "Chuyển hướng đến VNPAY");
            }
            case MOMO -> {
                // Gọi MoMoService nếu có
                return ApiResponse.buildOkResponse(null, "Chức năng MoMo đang được phát triển");
            }
            case COD -> {
                order = orderRepository.save(order);
                createOrderDetails(order, cart);
            }
            default -> throw new CustomException(ErrorCode.INVALID_PAYMENT_METHOD,
                    HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ: " + request.getPaymentMethod());
        }

        try {
            emailService.sendOrderConfirmationEmail(order, user.getEmail());
        } catch (Exception e) {
            throw new CustomException(ErrorCode.FAILED_TO_SEND_EMAIL,
                    HttpStatus.INTERNAL_SERVER_ERROR, "Gửi email thất bại: " + e.getMessage());
        }

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        orderResponse.setPaymentStatus(order.getPaymentStatus().name());
        return ApiResponse.buildCreatedResponse(orderResponse, "Tạo đơn hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<OrderResponse> changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));
        try {
            order.setStatus(OrderStatusEnum.valueOf(status.toUpperCase()));
        } catch (RuntimeException e) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS,
                    HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ: " + status);
        }
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.buildOkResponse(orderResponse, "Cập nhật trạng thái đơn hàng thành công");
    }

    @Override
    public ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));
        try {
            order.setPaymentStatus(PaymentStatusEnum.valueOf(paymentStatus.toUpperCase()));
        } catch (RuntimeException e) {
            throw new CustomException(ErrorCode.INVALID_PAYMENT_STATUS,
                    HttpStatus.BAD_REQUEST, "Trạng thái thanh toán không hợp lệ: " + paymentStatus);
        }
        orderRepository.save(order);

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.buildOkResponse(
                orderResponse,
                "Cập nhật trạng thái thanh toán đơn hàng thành công"
        );
    }

    @Override
    public ApiResponse<Long> getTotalOrder() {
        Long totalOrders = orderRepository.count();
        return ApiResponse.buildOkResponse(
                totalOrders,
                "Lấy tổng số đơn hàng thành công"
        );
    }

    @Override
    public ApiResponse<Long> getAllRevenue() {
        Long totalRevenue = orderRepository.getTotalRevenue(OrderStatusEnum.DELIVERED.toString(),
                PaymentStatusEnum.COMPLETED.toString());
        return ApiResponse.buildOkResponse(
                totalRevenue != null ? totalRevenue : 0L,
                "Lấy tổng doanh thu thành công"
        );
    }

    @Override
    public ApiResponse<List<OrderResponse>> getFiveNewestOrder() {
        List<Order> newestOrders = orderRepository.findTop5ByOrderByCreatedAtDesc();

        List<OrderResponse> orderResponse = newestOrders.stream()
                .map(order -> {
                    OrderResponse response = orderMapper.toOrderResponse(order);
                    response.setPaymentStatus(order.getPaymentStatus().name());
                    return response;
                })
                .toList();

        return ApiResponse.buildOkResponse(
                orderResponse,
                "Lấy 5 đơn hàng mới nhất thành công"
        );
    }

    @Override
    public ApiResponse<Void> cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));
        if (!order.getStatus().equals(OrderStatusEnum.PENDING)) {
            throw new CustomException(ErrorCode.CANNOT_CANCEL_ORDER,
                    HttpStatus.BAD_REQUEST, "Chỉ có thể hủy đơn hàng đang ở trạng thái Đang chờ xử lý");
        }

        order.setStatus(OrderStatusEnum.CANCELLED);
        orderRepository.save(order);

        return ApiResponse.buildOkResponse(null, "Hủy đơn hàng thành công");
    }

    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void scheduleCancelPendingOrders() {
        int canceledOrders = orderRepository.cancelPendingOrders(orderCancelMinutes);
        if (canceledOrders > 0) {
            log.info("Đã hủy {} đơn hàng ở trạng thái Đang chờ xử lý", canceledOrders);
        }
    }

    @Transactional
    void createOrderDetails(Order order, Cart cart) {
        List<CartItem> cartItems = cartItemRepository.findAllByCartAndSelected(cart, true);
        if (cartItems.isEmpty()) {
            throw new CustomException(ErrorCode.CART_EMPTY,
                    HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống");
        }

        for (CartItem cartItem : cartItems) {
            if(cartItem.isProductAvailable()) {
                OrderDetail orderDetail = OrderDetail.builder()
                        .order(order)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .priceAtOrder(cartItem.getProduct().getPriceNew())
                        .build();

                order.getOrderDetails().add(orderDetail);
                Product product = cartItem.getProduct();
                product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            } else {
                throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK,
                        HttpStatus.BAD_REQUEST,
                        "Sản phẩm " + cartItem.getProduct().getTitle() + " không đủ số lượng trong kho");
            }
        }
        cartItemRepository.removeAll(cartItems);
        cart.setTotalPrice(cart.getTotalPrice() - cartItems.stream()
                .mapToLong(cartItem
                        -> (long) cartItem.getQuantity() * cartItem.getProduct().getPriceNew())
                .sum());
        cartRepository.updateCart(cart);
    }

    private String buildCacheKey(OrderFilterRequest filterRequest, int pageIndex, int pageSize) {
        String orderStatus = filterRequest.getOrderStatus() != null ? filterRequest.getOrderStatus() : "ALL";
        String paymentStatus = filterRequest.getPaymentStatus() != null ? filterRequest.getPaymentStatus() : "ALL";
        String customerPhoneNumber = filterRequest.getCustomerPhoneNumber() != null ?
                filterRequest.getCustomerPhoneNumber() : "ALL";
        String fromDate = filterRequest.getFromDate() != null ? filterRequest.getFromDate().toString() : "NONE";
        String toDate = filterRequest.getToDate() != null ? filterRequest.getToDate().toString() : "NONE";

        return String.format("ORDER_FILTER:pageIndex=%s:pageSize=%s" +
                        ":orderStatus=%s:paymentStatus=%s:customerPhoneNumber=%s:fromDate=%s:toDate=%s"
        ,pageIndex, pageSize, orderStatus, paymentStatus, customerPhoneNumber, fromDate, toDate);
    }
}
