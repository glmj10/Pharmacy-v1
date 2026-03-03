package com.pharmacy_backend.order_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.request.PaymentRequest;
import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.*;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.BusinessException;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import com.pharmacy_backend.common.kafka.event.OrderReserveEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.service.RedisService;
import com.pharmacy_backend.common.utils.StateUtils;
import com.pharmacy_backend.order_service.config.AppConfig;
import com.pharmacy_backend.order_service.dto.request.OrderFilterRequest;
import com.pharmacy_backend.order_service.dto.request.OrderRequest;
import com.pharmacy_backend.order_service.dto.response.*;
import com.pharmacy_backend.order_service.entity.*;
import com.pharmacy_backend.order_service.mapper.OrderMapper;
import com.pharmacy_backend.order_service.mapper.ProductMapper;
import com.pharmacy_backend.order_service.repository.*;
import com.pharmacy_backend.order_service.service.CartServiceClient;
import com.pharmacy_backend.order_service.service.OrderService;
import com.pharmacy_backend.order_service.service.PaymentServiceClient;
import com.pharmacy_backend.order_service.service.ProductServiceClient;
import com.pharmacy_backend.order_service.specification.OrderSpecification;
import feign.FeignException;
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
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
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
    final CartServiceClient cartServiceClient;
    final ProductServiceClient productServiceClient;
    final ProductRepository productRepository;
    final OutboxRepository outboxRepository;
    final PaymentServiceClient paymentServiceClient;
    final VoucherRepository voucherRepository;
    final VoucherUsageRepository voucherUsageRepository;
    final UserVoucherRepository userVoucherRepository;
    final RedisService redisService;

    @Value("${order.timeout.order-cancel-minutes}")
    private Integer orderCancelMinutes;

    @Value("${spring.application.name}")
    private String appName;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<OrderResponse>>> getAllOrders(int pageIndex, int pageSize, OrderFilterRequest filterRequest) {
        if (pageIndex <= 0) {
            pageIndex = 1;
        }
        if (pageSize <= 0) {
            pageSize = 10;
        }

        String key = buildCacheKey(filterRequest, pageIndex, pageSize);
        Object cached = redisTemplate.opsForValue().get(key);

        if (cached != null) {
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

        if (filterRequest.getOrderStatus() != null) {
            try {
                orderSpecification = orderSpecification.and(OrderSpecification.hasStatus(
                        OrderStatusEnum.valueOf(filterRequest.getOrderStatus().toUpperCase()).toString())
                );
            } catch (IllegalArgumentException e) {
                throw new CustomException(ErrorCode.INVALID_ORDER_STATUS, HttpStatus.BAD_REQUEST, e.getMessage());
            }
        }

        if (filterRequest.getPaymentStatus() != null) {
            try {
                orderSpecification = orderSpecification.and(OrderSpecification.hasPaymentStatus(
                        PaymentStatusEnum.valueOf(filterRequest.getPaymentStatus().toUpperCase()).toString())
                );
            } catch (IllegalArgumentException e) {
                throw new CustomException(ErrorCode.INVALID_PAYMENT_STATUS, HttpStatus.BAD_REQUEST, e.getMessage());
            }
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findAll(orderSpecification, pageable);

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
        if (pageIndex <= 0) {
            pageIndex = 1;
        }

        if (pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize, Sort.by("createdAt").descending());

        Long userId = SecurityUtils.getCurrentUserId();
        assert userId != null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + userId));

        Page<Order> orders;
        if (status != null && !status.isEmpty()) {
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
        List<OrderDetail> orderDetails = orderDetailRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn hàng với ID: " + orderId));

        List<OrderDetailResponse> orderDetailResponses = orderDetails.stream()
                .map(orderDetail -> {
                    OrderDetailResponse response = orderMapper.toOrderDetailResponse(orderDetail);
                    ProductResponse productResponse = productMapper.toProductResponse(orderDetail.getProduct());
                    productResponse.setThumbnailUrl(AppConfig.getImagePrefix() + orderDetail.getProduct().getThumbnailUrl());
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

        if (!request.getPaymentMethod().equalsIgnoreCase(PaymentMethodEnum.VNPAY.name()) &&
                !request.getPaymentMethod().equalsIgnoreCase(PaymentMethodEnum.COD.name())) {
            throw new CustomException(ErrorCode.INVALID_PAYMENT_METHOD,
                    HttpStatus.BAD_REQUEST, "Phương thức thanh toán không hợp lệ: " + request.getPaymentMethod());
        }

        Order order = orderMapper.toOrder(request);
        order.setCustomerName(profile.getFullName());
        order.setCustomerPhoneNumber(profile.getPhoneNumber());
        order.setCustomerAddress(profile.getAddress());
        order.setUser(user);
        ApiResponse<CartResponse> cartResponse = cartServiceClient.getCartItemToCheckout();
        List<CartItemResponse> cartItems = cartResponse.getData().getCartItems();
        if (cartItems.isEmpty()) {
            throw new BusinessException(ErrorCode.CART_EMPTY.getMessage());
        }
        List<ReserveRequest> reserveRequests = cartItems.stream()
                .map(cartItem -> {
                    ReserveRequest reserveRequest = new ReserveRequest();
                    reserveRequest.setProductId(cartItem.getProduct().getId());
                    reserveRequest.setQuantity(cartItem.getQuantity());
                    return reserveRequest;
                })
                .toList();

        ApiResponse<ReserveResponse> reserveResponse = productServiceClient.reserveProduct(reserveRequests);
        try {

//            ApiResponse<ReserveResponse> reserveResponse;
//            try {
//                reserveResponse = productServiceClient.reserveProduct(
//                        reserveRequests
//                );
//            } catch (RuntimeException e) {
//                log.error("Lỗi khi gọi service Product để đặt trước sản phẩm: {}", e.getMessage());
//                throw new BusinessException(ErrorCode.PRODUCT_RESERVATION_FAILED);
//            }

//            if (reserveResponse.getStatus() != HttpStatus.CREATED.value()) {
//                throw new CustomException(ErrorCode.PRODUCT_RESERVATION_FAILED
//                        , (reserveResponse.getData() != null) ? reserveResponse.getData().getErrors() : null
//                        , reserveResponse.getMessage()
//                );
//            }

            long totalPrice = 0;

            for (ProductCheckResponse productCheckResponse : reserveResponse.getData().getProductCheckResponses()) {
                totalPrice += (long) productCheckResponse.getPriceNew() * productCheckResponse.getRequestedQuantity();
            }
            order.setSubtotalPrice(totalPrice);

            if (request.getVoucherId() != null) {
                Voucher voucher = voucherRepository.findById(request.getVoucherId())
                        .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND,
                                HttpStatus.NOT_FOUND));
                if (!voucher.getStatus().equals(VoucherStatusEnum.ACTIVE)) {
                    throw new CustomException(ErrorCode.VOUCHER_NOT_ACTIVE,
                            HttpStatus.BAD_REQUEST, "Voucher không còn hiệu lực");
                }

                boolean existsUsage = voucherUsageRepository.existsVoucherUsageByVoucherIdAndUserId(
                        voucher.getId(), user.getId()
                );

                if (existsUsage) {
                    throw new CustomException(ErrorCode.VOUCHER_ALREADY_USED,
                            HttpStatus.BAD_REQUEST);
                }

                if (totalPrice < voucher.getMinOrderValue()) {
                    throw new CustomException(ErrorCode.VOUCHER_MIN_ORDER_VALUE_NOT_MET,
                            HttpStatus.BAD_REQUEST);
                }

                if (voucher.getType() == VoucherTypeEnum.PUBLIC
                        && voucher.getCollectedCount() >= voucher.getUsageLimit()) {
                    throw new CustomException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED,
                            HttpStatus.BAD_REQUEST);
                } else if (voucher.getType() == VoucherTypeEnum.PRIVATE) {
                    boolean exist = userVoucherRepository.existsByUserIdAndVoucherId(user.getId(), voucher.getId());
                    if (!exist) {
                        throw new CustomException(ErrorCode.VOUCHER_NOT_ASSIGNED_TO_USER,
                                HttpStatus.BAD_REQUEST);
                    }
                } else {
                    int rowCnt = voucherRepository.increaseCollectedCount(voucher.getId());
                    if (rowCnt == 0) {
                        throw new CustomException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED,
                                HttpStatus.BAD_REQUEST);
                    }
                }

                int discountAmount;
                if (voucher.getDiscountType() == DiscountTypeEnum.FIXED_AMOUNT) {
                    discountAmount = voucher.getDiscountValue();
                } else {
                    discountAmount = (int) Math.min(
                            totalPrice * voucher.getDiscountValue() / 100,
                            voucher.getMaxDiscountAmount()
                    );
                }

                totalPrice -= discountAmount;
                order.setVoucherDiscountPrice((long) discountAmount);
                order.setVoucherId(voucher.getId());
                order.setVoucherCode(voucher.getCode());
            }

            order.setTotalPrice(totalPrice);


            OrderEvent orderEvent = OrderEvent.builder()
                    .orderId(order.getId())
                    .customerName(order.getCustomerName())
                    .customerPhoneNumber(order.getCustomerPhoneNumber())
                    .customerAddress(order.getCustomerAddress())
                    .userEmail(user.getEmail())
                    .totalPrice(order.getTotalPrice())
                    .createdAt(order.getCreatedAt())
                    .build();

            List<OrderDetailEvent> orderDetailEvents;

            Event<OrderEvent> event = Event.<OrderEvent>builder()
                    .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                    .eventType(EventTypeEnum.ORDER_CREATED.getName())
                    .data(orderEvent)
                    .source(appName)
                    .build();

            switch (PaymentMethodEnum.valueOf(request.getPaymentMethod().toUpperCase())) {
                case VNPAY -> {
                    order.setPaymentMethod(PaymentMethodEnum.VNPAY);
                    order = orderRepository.save(order);

                    orderEvent.setOrderId(order.getId());
                    orderEvent.setCreatedAt(order.getCreatedAt());
                    List<OrderDetail> orderDetails = createOrderDetails(order, cartItems);
                    orderDetailEvents = OrderService.mapToOrderDetailEvents(orderDetails);
                    orderEvent.setOrderDetailEventList(orderDetailEvents);

                    PaymentRequest paymentRequest = PaymentRequest.builder()
                            .orderId(order.getId())
                            .totalPrice(order.getTotalPrice())
                            .paymentMethodEnum(PaymentMethodEnum.VNPAY)
                            .build();

                    ApiResponse<String> paymentResponse = paymentServiceClient.createPaymentUrl(paymentRequest);

                    if (paymentResponse.getStatus() != HttpStatus.OK.value()) {
                        throw new CustomException(ErrorCode.PAYMENT_URL_CREATION_FAILED,
                                HttpStatus.INTERNAL_SERVER_ERROR, paymentResponse.getMessage());
                    }

                    String paymentUrl = paymentResponse.getData();

                    return ApiResponse.buildOkResponse(paymentUrl, "Chuyển hướng đến VNPAY");
                }

                case MOMO -> {
                    return ApiResponse.buildOkResponse(null, "Chức năng MoMo đang được phát triển");
                }

                case COD -> {
                    order.setPaymentMethod(PaymentMethodEnum.COD);
                    order = orderRepository.save(order);

                    if (request.getVoucherId() != null) {
                        VoucherUsage voucherUsage = VoucherUsage.builder()
                                .voucherId(request.getVoucherId())
                                .orderId(order.getId())
                                .userId(user.getId())
                                .build();
                        voucherUsageRepository.save(voucherUsage);

                        UserVoucher userVoucher = userVoucherRepository.findByUserIdAndVoucherId(
                                user.getId(), order.getVoucherId()
                        );
                        userVoucher.setIsUsed(true);

                        userVoucherRepository.save(userVoucher);
                    }

                    orderEvent.setOrderId(order.getId());
                    orderEvent.setCreatedAt(order.getCreatedAt());
                    List<OrderDetail> orderDetails = createOrderDetails(order, cartItems);
                    orderDetailEvents = OrderService.mapToOrderDetailEvents(orderDetails);
                    orderEvent.setOrderDetailEventList(orderDetailEvents);
                    handleSaveOutboxEvent(event);
                }
                default -> throw new CustomException(ErrorCode.INVALID_PAYMENT_METHOD);
            }

            OrderResponse orderResponse = orderMapper.toOrderResponse(order);
            orderResponse.setPaymentStatus(order.getPaymentStatus().name());
            return ApiResponse.buildCreatedResponse(orderResponse, "Tạo đơn hàng thành công");
        } catch (BusinessException ex) {
            throw ex;
        } catch (RuntimeException e) {
            log.error("Lỗi khi xử lý phương thức thanh toán: {}", e.getMessage());
            if(order != null) {
                List<OrderDetailEvent> orderDetailEventsFromCart = OrderService.mapToOrderDetailEventsFromCartItems(
                        cartItems);
                Event<OrderEvent> orderFailedEvent = createRollBackEvent(order, orderDetailEventsFromCart);
                handleSaveFailedOrder(order, orderFailedEvent);
            }

            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi trong quá trình tạo đơn hàng");
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void handleSaveFailedOrder(Order order, Event<?> event) {
        order.setStatus(OrderStatusEnum.FAILED);
        handleSaveOutboxEvent(event);
        orderRepository.save(order);
    }

    private Event<OrderEvent> createRollBackEvent(Order order, List<OrderDetailEvent> orderDetailEvents) {
        OrderEvent orderEvent = OrderEvent.builder()
                .orderId(order.getId())
                .customerName(order.getCustomerName())
                .customerPhoneNumber(order.getCustomerPhoneNumber())
                .customerAddress(order.getCustomerAddress())
                .userEmail(order.getUser().getEmail())
                .totalPrice(order.getTotalPrice())
                .createdAt(order.getCreatedAt())
                .orderDetailEventList(orderDetailEvents)
                .build();

        return Event.<OrderEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                .eventType(EventTypeEnum.ORDER_FAILED.getName())
                .data(orderEvent)
                .source(appName)
                .build();
    }

    @Transactional
    @Override
    public ApiResponse<OrderResponse> changeOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        OrderStatusEnum statusEnum;
        try {
            statusEnum = OrderStatusEnum.valueOf(status.toUpperCase());
        } catch (RuntimeException e) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS,
                    HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ: " + status);
        }

        if (!StateUtils.isValidTransition(order.getStatus(), statusEnum)) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS,
                    HttpStatus.BAD_REQUEST, "Không thể chuyển trạng thái đơn hàng từ "
                    + order.getStatus() + " sang " + status);
        }

        order.setStatus(statusEnum);

        orderRepository.save(order);

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn hàng với ID: " + id));

        OrderReserveEvent orderReserveEvent = OrderReserveEvent.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .build();

        List<OrderDetailEvent> orderDetailEvents = orderDetails.stream().map(
                orderDetail -> new OrderDetailEvent(orderDetail.getQuantity(),
                        orderDetail.getProduct().getId())
        ).toList();

        orderReserveEvent.setOrderDetailEventList(orderDetailEvents);

        Event<OrderReserveEvent> event = Event.<OrderReserveEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                .data(orderReserveEvent)
                .source(appName)
                .build();

        if (status.equalsIgnoreCase(OrderStatusEnum.CANCELLED.name())) {
            if (order.getVoucherId() != null) {
                Voucher voucher = voucherRepository.findById(order.getVoucherId())
                        .orElseThrow(() -> new RuntimeException(
                                "Voucher not found for voucherId: " + order.getVoucherId())
                        );
                if (voucher.getType() == VoucherTypeEnum.PUBLIC) {
                    voucher.setCollectedCount(voucher.getCollectedCount() - 1);
                    voucherRepository.save(voucher);
                }

                VoucherUsage voucherUsage = voucherUsageRepository.findByOrderIdAndVoucherId(
                        order.getId(), voucher.getId()
                );
                voucherUsageRepository.delete(voucherUsage);
            }

            event.setEventType(EventTypeEnum.ORDER_CANCELLED.getName());
            handleSaveOutboxEvent(event);
        } else {
            if (order.getPaymentMethod() == PaymentMethodEnum.COD) {
                event.setEventType(EventTypeEnum.ORDER_RELEASED.getName());
                handleSaveOutboxEvent(event);
            }
        }

        OrderResponse orderResponse = orderMapper.toOrderResponse(order);
        return ApiResponse.buildOkResponse(orderResponse, "Cập nhật trạng thái đơn hàng thành công");
    }


    @Override
    public ApiResponse<OrderResponse> changePaymentStatus(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy đơn hàng với ID: " + id));

        if (!StateUtils.isValidPaymentTransition(order.getPaymentStatus(),
                PaymentStatusEnum.valueOf(paymentStatus.toUpperCase()))) {
            throw new CustomException(ErrorCode.INVALID_PAYMENT_STATUS,
                    HttpStatus.BAD_REQUEST, "Không thể chuyển trạng thái thanh toán từ "
                    + order.getPaymentStatus() + " sang " + paymentStatus);
        }

        try {
            order.setPaymentStatus(PaymentStatusEnum.valueOf(paymentStatus.toUpperCase()));
        } catch (RuntimeException e) {
            log.error("Lỗi khi chuyển đổi trạng thái thanh toán: {}", e.getMessage());
            throw new CustomException(ErrorCode.INVALID_PAYMENT_STATUS,
                    HttpStatus.BAD_REQUEST, "Trạng thái thanh toán không hợp lệ: " + paymentStatus);
        }

        if (paymentStatus.equalsIgnoreCase(PaymentStatusEnum.FAILED.getName())) {
            order.setStatus(OrderStatusEnum.CANCELLED);
        }

        orderRepository.save(order);

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn hàng với ID: " + id));

        OrderReserveEvent orderReserveEvent = OrderReserveEvent.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .build();

        List<OrderDetailEvent> orderDetailEvents = orderDetails.stream().map(
                orderDetail -> new OrderDetailEvent(orderDetail.getQuantity(),
                        orderDetail.getProduct().getId())
        ).toList();

        orderReserveEvent.setOrderDetailEventList(orderDetailEvents);

        Event<OrderReserveEvent> event = Event.<OrderReserveEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                .data(orderReserveEvent)
                .source(appName)
                .build();

        if (order.getPaymentStatus().getName().equalsIgnoreCase(PaymentStatusEnum.FAILED.getName())) {
            event.setEventType(EventTypeEnum.ORDER_CANCELLED.getName());
        } else {
            event.setEventType(EventTypeEnum.ORDER_RELEASED.getName());
        }

        handleSaveOutboxEvent(event);


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

    @Transactional
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

        if (order.getVoucherId() != null) {
            Voucher voucher = voucherRepository.findById(order.getVoucherId())
                    .orElseThrow(() -> new RuntimeException(
                            "Voucher not found for voucherId: " + order.getVoucherId())
                    );
            if (voucher.getType() == VoucherTypeEnum.PUBLIC) {
                voucher.setCollectedCount(voucher.getCollectedCount() - 1);
                voucherRepository.save(voucher);
            }

            VoucherUsage voucherUsage = voucherUsageRepository.findByOrderIdAndVoucherId(
                    order.getId(), voucher.getId()
            );
            voucherUsageRepository.delete(voucherUsage);

            UserVoucher userVoucher = UserVoucher.builder()
                    .userId(order.getUser().getId())
                    .voucherId(voucher.getId())
                    .build();
            userVoucherRepository.save(userVoucher);
        }

        OrderReserveEvent orderReserveEvent = OrderReserveEvent.builder()
                .orderId(order.getId())
                .totalPrice(order.getTotalPrice())
                .build();

        List<OrderDetail> orderDetails = orderDetailRepository.findByOrder(order)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_DETAIL_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy chi tiết đơn hàng với ID: " + id));

        List<OrderDetailEvent> orderDetailEvents = orderDetails.stream().map(
                orderDetail -> new OrderDetailEvent(orderDetail.getQuantity(),
                        orderDetail.getProduct().getId())
        ).toList();

        orderReserveEvent.setOrderDetailEventList(orderDetailEvents);

        Event<OrderReserveEvent> event = Event.<OrderReserveEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.ORDER.getName(), order.getId()))
                .data(orderReserveEvent)
                .source(appName)
                .eventType(EventTypeEnum.ORDER_CANCELLED.getName())
                .build();

        handleSaveOutboxEvent(event);

        return ApiResponse.buildOkResponse(null, "Hủy đơn hàng thành công");
    }

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void scheduleCancelPendingOrders() {
        int canceledOrders = orderRepository.cancelPendingOrders(orderCancelMinutes);
        if (canceledOrders > 0) {
            log.info("Đã hủy {} đơn hàng ở trạng thái Đang chờ xử lý", canceledOrders);
        }
    }

    List<OrderDetail> createOrderDetails(Order order, List<CartItemResponse> cartItemResponses) {
        List<OrderDetail> orderDetails = new ArrayList<>();
        for (CartItemResponse cartItemResponse : cartItemResponses) {
            OrderDetail orderDetail = new OrderDetail();
            orderDetail.setOrder(order);
            orderDetail.setProduct(productRepository.findById(cartItemResponse.getProduct().getId()).orElse(null));
            orderDetail.setQuantity(cartItemResponse.getQuantity());
            orderDetail.setPriceAtOrder(cartItemResponse.getProduct().getPriceNew());
            orderDetails.add(orderDetail);
        }
        orderDetailRepository.saveAll(orderDetails);

        return orderDetails;
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
                , pageIndex, pageSize, orderStatus, paymentStatus, customerPhoneNumber, fromDate, toDate);
    }

    public void handleSaveOutboxEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.ORDER.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.ORDER_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }

//    public List<OrderDetailEvent> mapToOrderDetailEvents(List<OrderDetail> orderDetails) {
//        List<OrderDetailEvent> orderDetailEvents = new ArrayList<>();
//        for (OrderDetail orderDetail : orderDetails) {
//            OrderDetailEvent orderDetailEvent = new OrderDetailEvent();
//            orderDetailEvent.setProductId(orderDetail.getProduct().getId());
//            orderDetailEvent.setQuantity(orderDetail.getQuantity());
//            orderDetailEvent.setPriceAtOrder(orderDetail.getPriceAtOrder());
//            orderDetailEvents.add(orderDetailEvent);
//        }
//        return orderDetailEvents;
//    }

//    public List<OrderDetailEvent> mapToOrderDetailEventsFromCartItems(List<CartItemResponse> cartItems) {
//        List<OrderDetailEvent> orderDetailEvents = new ArrayList<>();
//        for (CartItemResponse cartItem : cartItems) {
//            OrderDetailEvent orderDetailEvent = new OrderDetailEvent();
//            orderDetailEvent.setProductId(cartItem.getProduct().getId());
//            orderDetailEvent.setQuantity(cartItem.getQuantity());
//            orderDetailEvent.setPriceAtOrder(cartItem.getProduct().getPriceNew());
//            orderDetailEvents.add(orderDetailEvent);
//        }
//        return orderDetailEvents;
//    }
}
