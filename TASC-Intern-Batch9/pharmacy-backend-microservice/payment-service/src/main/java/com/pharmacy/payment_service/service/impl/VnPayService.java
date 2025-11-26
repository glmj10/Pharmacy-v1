package com.pharmacy.payment_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy.payment_service.config.VnPayConfig;
import com.pharmacy.payment_service.entity.OutboxEvent;
import com.pharmacy.payment_service.entity.PaymentTransaction;
import com.pharmacy.payment_service.repository.OutboxEventRepository;
import com.pharmacy.payment_service.repository.PaymentTransactionRepository;
import com.pharmacy_backend.common.dto.request.PaymentRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.PaymentEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {
    private final VnPayConfig vnPayConfig;
    private final ObjectMapper objectMapper;
    private final OutboxEventRepository outboxRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${frontend.vnp-return}")
    private String frontendUrl;
    @Value("${spring.application.name}")
    private String appName;

    @Transactional
    public ApiResponse<String> handleVnPayReturn(Map<String, String> params) {
        String vnp_TxnRef = params.get("vnp_TxnRef");
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String receivedHash = params.get("vnp_SecureHash");

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");
        sortedParams.remove("vnp_SecureHashType");

        String generatedHash = hmacSHA512(vnPayConfig.getHashSecret(), buildQueryString(sortedParams));

        if (!generatedHash.equals(receivedHash)) {
            log.error("Invalid signature: received {}, generated {}", receivedHash, generatedHash);
            throw new CustomException(ErrorCode.SIGNATURE_NOT_VALID);
        }

        Long orderId = Long.parseLong(vnp_TxnRef);

        PaymentTransaction paymentTransaction = PaymentTransaction.builder()
                .orderId(orderId)
                .amount(Long.parseLong(params.get("vnp_Amount")) / 100)
                .transactionId(params.get("vnp_TransactionNo"))
                .responseCode(vnp_ResponseCode)
                .transactionDate(LocalDateTime.now())
                .paymentMethod(PaymentMethodEnum.VNPAY)
                .build();

        PaymentEvent paymentEvent = new PaymentEvent(orderId);
        Event<PaymentEvent> event = Event.<PaymentEvent>builder()
                .key(String.format("%d", orderId))
                .source(appName)
                .data(paymentEvent)
                .build();


        if ("00".equals(vnp_ResponseCode)) {
            if(paymentTransactionRepository.existByOrderIdAndPaymentStatus(orderId,
                    PaymentStatusEnum.COMPLETED.name()) > 0) {
                log.info("Order {} has already been paid", orderId);
                return ApiResponse.buildOkResponse("Đơn hàng đã được thanh toán",
                        "Vui lòng kiểm tra email để xác nhận đơn hàng");
            }
            paymentEvent.setPaymentStatus(PaymentStatusEnum.COMPLETED.getName());
            event.setEventType(EventTypeEnum.PAYMENT_COMPLETED.getName());
            paymentTransaction.setPaymentStatus(PaymentStatusEnum.COMPLETED);
            paymentTransactionRepository.save(paymentTransaction);
            handleSaveOutboxEvent(event);
            return ApiResponse.buildOkResponse("Thanh toán thành công",
                    "Vui lòng kiểm tra email để xác nhận đơn hàng");
        } else {
            paymentEvent.setPaymentStatus(PaymentStatusEnum.FAILED.getName());
            event.setEventType(EventTypeEnum.PAYMENT_FAILED.getName());
            paymentTransaction.setPaymentStatus(PaymentStatusEnum.FAILED);
            paymentTransactionRepository.save(paymentTransaction);
            handleSaveOutboxEvent(event);
            return ApiResponse.buildOkResponse(null, "Giao dịch đã bị hủy hoặc thất bại");
        }

    }

    public String createPaymentUrl(PaymentRequest request) {
        Map<String, String> params = new TreeMap<>();
        String vnp_TxnRef = String.valueOf(request.getOrderId());

        String vnp_OrderInfo = "Thanh toan don hang #" + vnp_TxnRef;
        String vnp_Amount = String.valueOf(request.getTotalPrice() * 100);
        HttpServletRequest servletRequest = SecurityUtils.getCurrentHttpServletRequest();

        String vnp_IpAddr = servletRequest.getRemoteAddr();
        String vnp_CreateDate = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));

        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", vnp_Amount);
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", vnp_TxnRef);
        params.put("vnp_OrderInfo", vnp_OrderInfo);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", frontendUrl + "/vnpay-return");
        params.put("vnp_IpAddr", vnp_IpAddr);
        params.put("vnp_CreateDate", vnp_CreateDate);

        String queryString = buildQueryString(params);
        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), queryString);

        return vnPayConfig.getVnpUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

//    public ApiResponse<String> recreatePaymentUrl(Long orderId) {
//        Order order = orderRepository.findById(orderId)
//                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
//                        HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));
//
//        Cart cart = order.getCart();
//        User user = cart.getUser();
//        if (!Objects.equals(user.getId(), Objects.requireNonNull(SecurityUtils.getCurrentUserId()))) {
//            throw new CustomException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
//                    "Bạn không có quyền truy cập đơn hàng này");
//        }
//
//        if (order.getPaymentStatus() == PaymentStatusEnum.COMPLETED) {
//            throw new CustomException(ErrorCode.ORDER_ALREADY_PAID, HttpStatus.BAD_REQUEST,
//                    "Đơn hàng đã được thanh toán");
//        }
//
//        HttpServletRequest servletRequest = SecurityUtils.getCurrentHttpServletRequest();
//        String paymentUrl = createPaymentUrl(order, servletRequest);
//        return ApiResponse.buildOkResponse(paymentUrl, "Tạo URL thanh toán thành công");
//    }

    private String buildQueryString(Map<String, String> params) {
        return params.entrySet().stream()
                .map(entry ->
                        entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .collect(Collectors.joining("&"));
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] hashBytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("Không thể tạo chữ ký hash", e);
        }
    }

    public void handleSaveOutboxEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.PAYMENT.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.PAYMENT_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }
}
