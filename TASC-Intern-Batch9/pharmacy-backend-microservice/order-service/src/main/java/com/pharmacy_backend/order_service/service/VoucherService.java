package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.UserVoucherRequest;
import com.pharmacy_backend.order_service.dto.request.VoucherRequest;
import com.pharmacy_backend.order_service.dto.response.VoucherResponse;

import java.util.List;

public interface VoucherService {
    ApiResponse<PageResponse<List<VoucherResponse>>> getVouchers(int pageIndex,
                                                                 int pageSize,
                                                                 String type);
    ApiResponse<VoucherResponse> getVoucherById(Long id);
    ApiResponse<Void> createVoucher(VoucherRequest request);
    ApiResponse<Void> updateVoucher(Long id,  VoucherRequest request);
    ApiResponse<Void> deleteVoucher(Long id);
    ApiResponse<Void> claimVoucher(UserVoucherRequest request);
    void changeVoucherStatus(Long voucherId, String status);
    ApiResponse<PageResponse<List<VoucherResponse>>> getUserVouchers(int pageIndex,
                                                                 int pageSize, String type);
}
