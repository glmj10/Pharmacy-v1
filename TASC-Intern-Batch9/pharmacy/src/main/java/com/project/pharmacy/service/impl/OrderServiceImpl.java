package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.request.OrderFilterRequest;
import com.project.pharmacy.dto.request.OrderRequest;
import com.project.pharmacy.dto.response.*;
import com.project.pharmacy.entity.*;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.enums.OrderStatusEnum;
import com.project.pharmacy.enums.PaymentMethodEnum;
import com.project.pharmacy.enums.PaymentStatusEnum;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.OrderMapper;
import com.project.pharmacy.mapper.ProductMapper;
import com.project.pharmacy.repository.*;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.EmailService;
import com.project.pharmacy.service.OrderService;
import com.project.pharmacy.specification.OrderSpecification;
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
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class OrderServiceImpl implements OrderService {
    final OrderRepository orderRepository;
    final OrderMapper orderMapper;
    final CartRepository cartRepository;
    final UserRepository userRepository;
    final OrderDetailRepository orderDetailRepository;
    final CartItemRepository cartItemRepository;
    final ProfileRepository profileRepository;
    final ProductMapper productMapper;
    final EmailService emailService;
    final VnPayService vnPayService;
    final FileMetadataRepository fileMetadataRepository;

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

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách đơn hàng thành công");
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
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng của người dùng với ID: " + userId));

        Page<Order> orders;
        if(status != null && !status.isEmpty()) {
            OrderStatusEnum orderStatus = OrderStatusEnum.valueOf(status.toUpperCase());
            orders = orderRepository.findByCartAndStatus(cart, orderStatus, pageable);
        } else {
            orders = orderRepository.findByCart(cart, pageable);
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
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(
                            UUID.fromString(orderDetail.getProduct().getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy ảnh đại diện sản phẩm với ID: "
                                    + orderDetail.getProduct().getThumbnail()));
                    productResponse.setThumbnailUrl(fileMetadata.getUrl());
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
        Profile profile = profileRepository.findByUserAndId(user, request.getProfileId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hồ sơ với ID: " + request.getProfileId()));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy giỏ hàng của người dùng với ID: " + user.getId()));

        Order order = orderMapper.toOrder(request);
        order.setCustomerName(profile.getFullName());
        order.setCustomerPhoneNumber(profile.getPhoneNumber());
        order.setCustomerAddress(profile.getAddress());
        order.setCart(cart);
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

    @Scheduled(cron = "0 0 * * * *")
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
                .mapToLong(cartItem -> (long) cartItem.getQuantity() * cartItem.getProduct().getPriceNew())
                .sum());
        cartRepository.updateCart(cart);
    }

}
