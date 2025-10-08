package com.project.pharmacy.service.impl;

import com.project.pharmacy.config.VnPayConfig;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.Order;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.enums.OrderStatusEnum;
import com.project.pharmacy.enums.PaymentStatusEnum;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.OrderRepository;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnPayService {
    private final OrderRepository orderRepository;
    private final VnPayConfig vnPayConfig;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${frontend.vnp-return}")
    String frontendUrl;

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
            throw new CustomException(ErrorCode.SIGNATURE_NOT_VALID, HttpStatus.BAD_REQUEST, "Chữ ký không hợp lệ");
        }

        Order order = orderRepository.findById(Long.parseLong(vnp_TxnRef))
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));


        if ("00".equals(vnp_ResponseCode)) {
                if(order.getPaymentStatus() == PaymentStatusEnum.COMPLETED) {
                    return ApiResponse.buildOkResponse("Đơn hàng đã được thanh toán",
                            "Vui lòng kiểm tra email để xác nhận đơn hàng");
                } else {
                    order.setPaymentStatus(PaymentStatusEnum.COMPLETED);
                    order.setStatus(OrderStatusEnum.PENDING);
                    try {
                        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
                        emailService.sendOrderConfirmationEmail(order, user.getEmail());
                    } catch (Exception e) {
                        throw new CustomException(ErrorCode.FAILED_TO_SEND_EMAIL, HttpStatus.INTERNAL_SERVER_ERROR,
                                "Gửi email thất bại: " + e.getMessage());
                    }
                }
        } else {
                order.setPaymentStatus(PaymentStatusEnum.FAILED);
                order.setStatus(OrderStatusEnum.CANCELLED);
        }

        orderRepository.save(order);
        return ApiResponse.buildOkResponse("Thanh toán thành công",
                "Vui lòng kiểm tra email để xác nhận đơn hàng");
    }

    public String createPaymentUrl(Order order, HttpServletRequest request) {
        Map<String, String> params = new TreeMap<>();
        String vnp_TxnRef = String.valueOf(order.getId() + new Random().nextInt(1000));

        String vnp_OrderInfo = "Thanh toan don hang #" + vnp_TxnRef;
        String vnp_Amount = String.valueOf(order.getTotalPrice() * 100);
        String vnp_IpAddr = request.getRemoteAddr();
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

    public ApiResponse<String> recreatePaymentUrl(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Đơn hàng không tồn tại"));

        Cart cart = order.getCart();
        User user = cart.getUser();
        if (!Objects.equals(user.getId(), Objects.requireNonNull(SecurityUtils.getCurrentUserId()))) {
            throw new CustomException(ErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED,
                    "Bạn không có quyền truy cập đơn hàng này");
        }

        if (order.getPaymentStatus() == PaymentStatusEnum.COMPLETED) {
            throw new CustomException(ErrorCode.ORDER_ALREADY_PAID, HttpStatus.BAD_REQUEST,
                    "Đơn hàng đã được thanh toán");
        }

        HttpServletRequest servletRequest = SecurityUtils.getCurrentHttpServletRequest();
        String paymentUrl = createPaymentUrl(order, servletRequest);
        return ApiResponse.buildOkResponse(paymentUrl, "Tạo URL thanh toán thành công");
    }

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
}
