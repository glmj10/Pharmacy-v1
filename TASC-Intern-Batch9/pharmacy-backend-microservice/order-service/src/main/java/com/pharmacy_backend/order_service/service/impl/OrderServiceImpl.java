package com.pharmacy_backend.order_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.request.PaymentRequest;
import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.dto.response.ProductCheckResponse;
import com.pharmacy_backend.common.dto.response.ReserveResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import com.pharmacy_backend.common.kafka.event.OrderReserveEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.StateUtils;
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
            orderSpecification = orderSpecification.and(OrderSpecification.hasStatus(
                    OrderStatusEnum.valueOf(filterRequest.getOrderStatus().toUpperCase()).toString())
            );
        }

        if (filterRequest.getPaymentStatus() != null) {
            orderSpecification = orderSpecification.and(OrderSpecification.hasPaymentStatus(
                    PaymentStatusEnum.valueOf(filterRequest.getPaymentStatus().toUpperCase()).toString())
            );
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
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

    @Override
    public ApiResponse<?> createOrder(OrderRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy người dùng với ID: " + SecurityUtils.getCurrentUserId()));
        Profile profile = profileRepository.findUserProfile(user.getId(), request.getProfileId())
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy thông tin nhận hàng với ID: " + request.getProfileId()));

        if(!request.getPaymentMethod().equalsIgnoreCase(PaymentMethodEnum.VNPAY.name()) &&
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
            throw new CustomException(ErrorCode.CART_EMPTY,
                    HttpStatus.BAD_REQUEST, "Giỏ hàng của bạn đang trống");
        }

        List<ReserveRequest> reserveRequests = cartItems.stream()
                .map(cartItem -> {
                    ReserveRequest reserveRequest = new ReserveRequest();
                    reserveRequest.setProductId(cartItem.getProduct().getId());
                    reserveRequest.setQuantity(cartItem.getQuantity());
                    return reserveRequest;
                })
                .toList();

        ApiResponse<ReserveResponse> reserveResponse = productServiceClient.reserveProduct(
                reserveRequests
        );

        if (reserveResponse.getStatus() != HttpStatus.CREATED.value()) {
            throw new CustomException(ErrorCode.PRODUCT_RESERVATION_FAILED
                    , (reserveResponse.getData() != null) ? reserveResponse.getData().getErrors() : null
                    , reserveResponse.getMessage()
            );
        }

        long totalPrice = 0;

        for (ProductCheckResponse productCheckResponse : reserveResponse.getData().getProductCheckResponses()) {
            totalPrice += (long) productCheckResponse.getPriceNew() * productCheckResponse.getRequestedQuantity();
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

        try {
            switch (PaymentMethodEnum.valueOf(request.getPaymentMethod().toUpperCase())) {
                case VNPAY -> {
                    order.setPaymentMethod(PaymentMethodEnum.VNPAY);
                    order = orderRepository.save(order);
                    List<OrderDetail> orderDetails = createOrderDetails(order, cartItems);
                    orderDetailEvents = OrderService.mapToOrderDetailEvents(orderDetails);
                    orderEvent.setOrderDetailEventList(orderDetailEvents);

                    PaymentRequest paymentRequest = PaymentRequest.builder()
                            .orderId(order.getId())
                            .totalPrice(order.getTotalPrice())
                            .paymentMethodEnum(PaymentMethodEnum.VNPAY)
                            .build();

                    // Tạo URL thanh toán VNPAY
                    ApiResponse<String> paymentResponse = paymentServiceClient.createPaymentUrl(paymentRequest);

                    if (paymentResponse.getStatus() != HttpStatus.OK.value()) {
                        throw new CustomException(ErrorCode.PAYMENT_URL_CREATION_FAILED,
                                HttpStatus.INTERNAL_SERVER_ERROR, paymentResponse.getMessage());
                    }

                    String paymentUrl = paymentResponse.getData();

                    return ApiResponse.buildOkResponse(paymentUrl, "Chuyển hướng đến VNPAY");
                }

                case MOMO -> {
                    // Gọi MoMoService nếu có
                    return ApiResponse.buildOkResponse(null, "Chức năng MoMo đang được phát triển");
                }

                case COD -> {
                    order.setPaymentMethod(PaymentMethodEnum.COD);
                    order = orderRepository.save(order);
                    List<OrderDetail> orderDetails = createOrderDetails(order, cartItems);
                    orderDetailEvents = OrderService.mapToOrderDetailEvents(orderDetails);
                    orderEvent.setOrderDetailEventList(orderDetailEvents);
                    handleSaveOutboxEvent(event);
                }
                default -> throw new CustomException(ErrorCode.INVALID_PAYMENT_METHOD);
            }
        } catch (RuntimeException e) {
            log.error("Lỗi khi xử lý phương thức thanh toán: {}", e.getMessage());
            event.setEventType(EventTypeEnum.ORDER_FAILED.getName());
            List<OrderDetailEvent> orderDetailEventsFromCart = OrderService.mapToOrderDetailEventsFromCartItems(
                    cartItems);
            orderEvent.setOrderDetailEventList(orderDetailEventsFromCart);
            handleSaveOutboxEvent(event);
            order.setStatus(OrderStatusEnum.FAILED);
            orderRepository.save(order);
            throw new CustomException(ErrorCode.INVALID_PAYMENT_METHOD,
                    HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi trong quá trình tạo đơn hàng");
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

        if (!StateUtils.isValidTransition(order.getStatus(), OrderStatusEnum.valueOf(status.toUpperCase()))) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS,
                    HttpStatus.BAD_REQUEST, "Không thể chuyển trạng thái đơn hàng từ "
                    + order.getStatus() + " sang " + status);
        }

        try {
            order.setStatus(OrderStatusEnum.valueOf(status.toUpperCase()));
        } catch (RuntimeException e) {
            throw new CustomException(ErrorCode.INVALID_ORDER_STATUS,
                    HttpStatus.BAD_REQUEST, "Trạng thái đơn hàng không hợp lệ: " + status);
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

        if (status.equalsIgnoreCase(OrderStatusEnum.CANCELLED.name())) {
            event.setEventType(EventTypeEnum.ORDER_CANCELLED.getName());
            handleSaveOutboxEvent(event);
        } else {
            if(order.getPaymentMethod() == PaymentMethodEnum.COD) {
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

        if(!StateUtils.isValidPaymentTransition(order.getPaymentStatus(),
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

        if(paymentStatus.equalsIgnoreCase(PaymentStatusEnum.FAILED.getName())) {
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
