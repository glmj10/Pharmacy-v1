package com.project.pharmacy.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    USER_NOT_FOUND("Người dùng không tồn tại"),
    INVALID_USER_ROLE("Vai trò người dùng không hợp lệ"),
    USER_ALREADY_EXISTS("Người dùng đã tồn tại"),

    INVALID_CREDENTIALS("Thông tin đăng nhập không hợp lệ"),
    PRODUCT_NOT_FOUND("Sản phẩm không tồn tại"),
    INSUFFICIENT_STOCK("Số lượng trong kho không đủ"),
    ORDER_NOT_FOUND("Đơn hàng không tồn tại"),
    PAYMENT_FAILED("Thanh toán không thành công"),

    UNAUTHORIZED("Truy cập không được phép"),
    FORBIDDEN("Quyền truy cập bị từ chối"),
    INVALID_TOKEN("Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),

    INVALID_REQUEST("Yêu cầu không hợp lệ"),
    SERVER_ERROR("Lỗi máy chủ, vui lòng thử lại sau"),
    EMAIL_ALREADY_EXISTS("Email đã tồn tại"),
    PRODUCT_ALREADY_EXISTS("Sản phẩm đã tồn tại"),

    CATEGORY_NOT_FOUND("Danh mục không tồn tại"),
    CATEGORY_ALREADY_EXISTS("Danh mục đã tồn tại"),

    BLOG_NOT_FOUND("Bài viết không tồn tại"),

    WISHLIST_NOT_FOUND("Danh sách yêu thích không tồn tại"),

    CART_NOT_FOUND("Giỏ hàng không tồn tại"),

    RESOURCE_NOT_FOUND("Tài nguyên không tồn tại"),
    RESOURCE_ALREADY_EXISTS("Tài nguyên đã tồn tại"),

    VALIDATION_ERROR("Lỗi xác thực dữ liệu"),
    BUSINESS_ERROR("Lỗi nghiệp vụ"),
    INTERNAL_SERVER_ERROR("Lỗi máy chủ nội bộ"),
    ;

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

}
