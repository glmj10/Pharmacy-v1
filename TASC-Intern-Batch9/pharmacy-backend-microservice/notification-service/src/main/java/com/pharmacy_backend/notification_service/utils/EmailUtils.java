package com.pharmacy_backend.notification_service.utils;

import com.pharmacy_backend.common.kafka.event.OrderDetailEvent;
import com.pharmacy_backend.common.kafka.event.OrderEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;


@Component
public class EmailUtils {

    @Value("${frontend.user-url}")
    private String userUrl;

    @Value("${frontend.cms-url}")
    private String adminUrl;

    public static String buildOrderConfirmationEmail(OrderEvent orderEvent, String orderDetails) {
        return """
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>✅ Cảm ơn bạn đã đặt hàng tại <strong>Hiệu Thuốc</strong>!</h2>

                <p><strong>Khách hàng:</strong> %s</p>
                <p><strong>SĐT:</strong> %s</p>
                <p><strong>Địa chỉ:</strong> %s</p>
                <p><strong>Mã đơn hàng:</strong> #%d</p>
                <p><strong>Ngày đặt:</strong> %s</p>

                <h3>📦 Danh sách sản phẩm</h3>
                <table border="1" cellpadding="8" cellspacing="0" width="100%%" style="border-collapse: collapse;">
                  <thead style="background-color: #f5f5f5;">
                    <tr>
                      <th>STT</th>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    %s
                  </tbody>
                </table>

                <h3 style="text-align: right;">Tổng thanh toán: <span style="color: green;">%,.0f₫</span></h3>

                <p>Chúng tôi sẽ liên hệ để giao hàng sớm nhất. Trân trọng!</p>
                <p><em>Nhà Thuốc Pharmacy</em></p>
              </body>
            </html>
        """.formatted(orderEvent.getCustomerName(), orderEvent.getCustomerPhoneNumber(), orderEvent.getCustomerAddress(),
                orderEvent.getOrderId(), orderEvent.getCreatedAt(), orderDetails, (double) orderEvent.getTotalPrice());
    }

    public static String buildOrderDetailRow(List<OrderDetailEvent> orderDetails) {
        StringBuilder rows = new StringBuilder();
        int i = 1;
        for( OrderDetailEvent event : orderDetails) {
            long quantity = event.getQuantity();
            long price = event.getPriceAtOrder();
            long totalPrice = quantity * price;

            rows.append(String.format("""
            <tr>
              <td style="text-align:center;">%d</td>
              <td>%s</td>
              <td style="text-align:right;">%,.0f₫</td>
              <td style="text-align:center;">%d</td>
              <td style="text-align:right;">%,.0f₫</td>
            </tr>
        """, i++, event.getTitle(), (double) price, quantity, (double) totalPrice));
        }

        return rows.toString();
    }

    public String buildUserResetPasswordEmail(String otp, int expiryMinutes) {
        return """
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>🔒 Yêu cầu đặt lại mật khẩu</h2>

            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

            <p>Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:</p>

            <h1 style="font-size: 32px; letter-spacing: 4px; color: #007bff;">%s</h1>

            <p>Mã OTP sẽ hết hạn sau <b>%d phút</b>.</p>

            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>

            <p>Trân trọng,<br>Nhà Thuốc Pharmacy</p>
          </body>
        </html>
    """.formatted(otp, expiryMinutes);
    }

    public String buildResetPasswordEmail(String otp, int expiryMinutes) {
        return """
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>🔒 Yêu cầu đặt lại mật khẩu</h2>

            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

            <p>Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:</p>

            <h1 style="font-size: 32px; letter-spacing: 4px; color: #007bff;">%s</h1>

            <p>Mã OTP sẽ hết hạn sau <b>%d phút</b>.</p>

            <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>

            <p>Trân trọng,<br>Nhà Thuốc Pharmacy</p>
          </body>
        </html>
    """.formatted(otp, expiryMinutes);
    }


//    public String buildAdminResetPasswordEmail(String token, LocalDateTime expiryAt) {
//        return """
//            <html>
//              <body style="font-family: Arial, sans-serif; color: #333;">
//                <h2>🔒 Yêu cầu đặt lại mật khẩu</h2>
//
//                <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
//
//                <p>Vui lòng sử dụng mã OTP dưới đây để đặt lại mật khẩu:</p>
//
//                <h1 style="font-size: 32px; letter-spacing: 4px; color: #007bff;">%s</h1>
//
//                <p>Mã OTP sẽ hết hạn sau <b>%d phút</b>.</p>
//
//                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
//
//                <p>Trân trọng,<br>Nhà Thuốc Pharmacy</p>
//              </body>
//            </html>
//        """.formatted(adminUrl, token, expiryAt.toLocalTime().toString());
//    }

    public String buildVerifyAccountEmail(String token, LocalDateTime expiryAt) {
        return """
            <html>
              <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>✅ Xác thực tài khoản của bạn</h2>
                <p>Cảm ơn bạn đã đăng ký tài khoản tại Nhà Thuốc Pharmacy.</p>
                <p>Vui lòng nhấp vào liên kết dưới đây để xác thực tài khoản của bạn:</p>
                <p><a href="%s/verify-account?token=%s" style="color: #007bff;">Xác thực tài khoản</a></p>
                <p>Liên kết này sẽ hết hạn sau %s. phút</p>
                <p>Nếu bạn không đăng ký tài khoản, vui lòng bỏ qua email này.</p>
                <p>Trân trọng,<br>Nhà Thuốc Pharmacy</p>
              </body>
            </html>
        """.formatted(userUrl, token, expiryAt.toLocalTime().toString());
    }

}
