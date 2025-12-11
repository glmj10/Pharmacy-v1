package com.pharmacy_backend.common.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {
    TOO_MANY_REQUESTS("Quá nhiều yêu cầu, vui lòng thử lại sau"),
    FILE_SIZE_EXCEEDED("Kích thước tệp vượt quá giới hạn cho phép"),

    USER_NOT_FOUND("Người dùng không tồn tại"),
    INVALID_USER_ROLE("Vai trò người dùng không hợp lệ"),
    USER_ALREADY_EXISTS("Người dùng đã tồn tại"),
    USER_ALREADY_VERIFIED("Người dùng đã được xác thực"),

    PROFILE_NOT_FOUND("Thông tin cá nhân không tồn tại"),
    PROFILE_ALREADY_EXISTS("Thông tin cá nhân đã tồn tại"),

    INVALID_ROLE("Vai trò không hợp lệ"),
    ROLE_NOT_FOUND("Vai trò không tồn tại"),
    ROLE_ALREADY_EXISTS("Vai trò đã tồn tại"),

    INVALID_CREDENTIALS("Thông tin đăng nhập không hợp lệ"),
    PRODUCT_NOT_FOUND("Sản phẩm không tồn tại"),
    PRODUCT_INACTIVE("Sản phẩm không hoạt động"),
    PRODUCT_RESERVATION_FAILED("Đặt sản phẩm không thành công"),

    INSUFFICIENT_STOCK("Số lượng trong kho không đủ"),

    ORDER_NOT_FOUND("Đơn hàng không tồn tại"),
    PAYMENT_FAILED("Thanh toán không thành công"),

    UNAUTHORIZED("Không có quyền truy cập"),
    FORBIDDEN("Quyền truy cập bị từ chối"),
    INVALID_TOKEN("Phiên đăng nhập không hợp lệ hoặc đã hết hạn"),

    INVALID_REQUEST("Yêu cầu không hợp lệ"),
    SERVER_ERROR("Lỗi máy chủ, vui lòng thử lại sau"),
    EMAIL_ALREADY_EXISTS("Email đã tồn tại"),
    PRODUCT_ALREADY_EXISTS("Sản phẩm đã tồn tại"),

    CATEGORY_NOT_FOUND("Danh mục không tồn tại"),
    CATEGORY_ALREADY_EXISTS("Danh mục đã tồn tại"),
    INVALID_CATEGORY_TYPE("Loại danh mục không hợp lệ"),

    BLOG_NOT_FOUND("Bài viết không tồn tại"),

    WISHLIST_NOT_FOUND("Danh sách yêu thích không tồn tại"),

    CART_NOT_FOUND("Giỏ hàng không tồn tại"),
    CART_EMPTY("Giỏ hàng trống"),

    RESOURCE_NOT_FOUND("Tài nguyên không tồn tại"),
    RESOURCE_ALREADY_EXISTS("Tài nguyên đã tồn tại"),

    VALIDATION_ERROR("Lỗi xác thực dữ liệu"),
    BUSINESS_ERROR("Lỗi nghiệp vụ"),
    INTERNAL_SERVER_ERROR("Lỗi máy chủ nội bộ"),

    UNSUPPORTED_MEDIA_TYPE("Định dạng không được hỗ trợ"),
    UNSUPPORTED_OPERATION("Phương thức không được hỗ trợ"),

    FILE_NOT_FOUND("Tệp tin không tồn tại"),
    FILE_STORAGE_ERROR("Lỗi lưu trữ tệp tin"),

    BAD_REQUEST("Yêu cầu không hợp lệ"),

    TYPE_NOT_FOUND("Loại danh mục không tồn tại"),
    TYPE_ALREADY_EXISTS("Loại danh mục đã tồn tại"),

    BRAND_NOT_FOUND("Thương hiệu không tồn tại"),
    BRAND_ALREADY_EXISTS("Thương hiệu đã tồn tại"),

    IMAGE_NOT_FOUND("Hình ảnh không tồn tại"),
    THUMBNAIL_REQUIRED("Yêu cầu hình ảnh đại diện"),

    INSUFFICIENT_PRODUCT_QUANTITY("Số lượng sản phẩm không đủ"),
    CART_ITEM_NOT_FOUND("Mục giỏ hàng không tồn tại"),
    PRODUCT_OUT_OF_STOCK("Sản phẩm hết hàng"),
    
    SIGNATURE_NOT_VALID("Chữ ký không hợp lệ"),

    ORDER_DETAIL_NOT_FOUND("Chi tiết đơn hàng không tồn tại"),
    CANNOT_CANCEL_ORDER("Không thể hủy đơn hàng"),
    INVALID_ORDER_STATUS("Trạng thái đơn hàng không hợp lệ"),

    FAILED_TO_SEND_EMAIL("Gửi email thất bại"),
    INVALID_PAYMENT_METHOD("Phương thức thanh toán không hợp lệ"),
    INVALID_PAYMENT_STATUS("Trạng thái thanh toán không hợp lệ"),

    CONTACT_NOT_FOUND("Yêu cầu tư vấn không tồn tại"),
    MISSING_REQUEST_PART("Thiếu phần yêu cầu"),
    ILLEGAL_STATE("Trạng thái không hợp lệ"),
    STOCK_NOT_FOUND("Kho hàng không tồn tại"),

    PAYMENT_URL_CREATION_FAILED("Tạo URL thanh toán không thành công"),

    FLASH_SALE_EVENT_NOT_FOUND("Sự kiện flash sale không tồn tại"),
    FLASH_SALE_ITEM_ALREADY_EXISTS("Sản phẩm trong sự kiện flash sale đã tồn tại"),
    INVALID_FLASH_SALE_PRICE("Giá flash sale không hợp lệ"),
    INVALID_SALE_STOCK("Số lượng flash sale không hợp lệ"),
    ORDER_DETAIL_ALREADY_RATED("Chi tiết đơn hàng đã được đánh giá"),

    CANNOT_RATE_UNDELIVERED_ORDER("Không thể đánh giá đơn hàng chưa được giao")

    ;

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    public String getName() {
        return this.name();
    }
}
