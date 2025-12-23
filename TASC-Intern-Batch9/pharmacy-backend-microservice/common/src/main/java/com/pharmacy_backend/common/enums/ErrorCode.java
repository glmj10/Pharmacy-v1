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

    PROMOTION_EVENT_NOT_FOUND("Sự kiện không tồn tại"),
    PROMOTION_ITEM_ALREADY_EXISTS("Sản phẩm đã tồn tại trong sự kiện"),
    PROMOTION_ITEM_ALREADY_EXISTS_IN_DIFFERENT_EVENT("Sản phẩm đã tồn tại trong một sự kiện khuyến mãi khác"),
    INVALID_PROMOTION_PRICE("Giá sản phẩm khuyến mãi không hợp lệ"),
    INVALID_PROMOTION_STATUS("Trạng thái khuyến mãi không hợp lệ"),
    PROMOTION_ITEM_INVALID_SALE_PRICE("Giá khuyến mãi của sản phẩm không được lớn hơn giá gốc"),
    CANNOT_UPDATE_ONGOING_PROMOTION("Không thể cập nhật sự kiện khuyến mãi đang hoạt động"),
    CANNOT_DELETE_ONGOING_PROMOTION("Không thể xóa sự kiện khuyến mãi đang hoạt động"),
    ORDER_DETAIL_ALREADY_RATED("Chi tiết đơn hàng đã được đánh giá"),

    CANNOT_RATE_UNDELIVERED_ORDER("Không thể đánh giá đơn hàng chưa được giao"),
    FILE_UPLOAD_FAILED("Tải tệp tin lên không thành công"),

    VOUCHER_NOT_FOUND("Mã giảm giá không tồn tại"),
    VOUCHER_ALREADY_CLAIMED("Mã giảm giá đã nhận"),
    VOUCHER_EXPIRED("Mã giảm giá đã hết hạn"),
    VOUCHER_NOT_ACTIVE("Mã giảm giá không hoạt động"),
    VOUCHER_USAGE_LIMIT_REACHED("Mã giảm giá đã đạt giới hạn sử dụng"),
    VOUCHER_CANNOT_CLAIM("Không thể nhận mã giảm giá"),
    CANNOT_UPDATE_VOUCHER_TYPE("Không thể cập nhật loại mã giảm giá có trạng thái đang hoạt động"),
    VOUCHER_MIN_ORDER_VALUE_NOT_MET("Giá trị đơn hàng không đạt yêu cầu để sử dụng mã giảm giá"),
    VOUCHER_ALREADY_USED("Mã giảm giá đã được sử dụng"),
    VOUCHER_NOT_ASSIGNED_TO_USER("Mã giảm giá chưa được gán cho người dùng"),
    ;

    private final String message;

    ErrorCode(String message) {
        this.message = message;
    }

    public String getName() {
        return this.name();
    }
}
