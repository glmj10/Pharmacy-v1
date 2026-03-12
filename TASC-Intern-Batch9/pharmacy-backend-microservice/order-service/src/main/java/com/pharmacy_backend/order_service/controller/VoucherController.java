package com.pharmacy_backend.order_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.order_service.dto.request.UserVoucherRequest;
import com.pharmacy_backend.order_service.dto.request.VoucherFilterRequest;
import com.pharmacy_backend.order_service.dto.request.VoucherRequest;
import com.pharmacy_backend.order_service.dto.response.VoucherResponse;
import com.pharmacy_backend.order_service.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/vouchers")
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<VoucherResponse>>>> getVouchers(@RequestParam(defaultValue = "1") int pageIndex,
                                                                                        @RequestParam(defaultValue = "10") Integer pageSize,
                                                                                        @ModelAttribute VoucherFilterRequest request) {
        ApiResponse<PageResponse<List<VoucherResponse>>> response = voucherService.getVouchers(pageIndex, pageSize, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        ApiResponse<VoucherResponse> response = voucherService.getVoucherById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/user/me")
    public ResponseEntity<ApiResponse<PageResponse<List<VoucherResponse>>>> getUserVouchers(@RequestParam(defaultValue = "1") int pageIndex,
                                                                                            @RequestParam(defaultValue = "10") int pageSize,
                                                                                            @RequestParam(required = false) String type,
                                                                                            @RequestParam(required = false) String status) {
        ApiResponse<PageResponse<List<VoucherResponse>>> response = voucherService.getUserVouchers(pageIndex, pageSize, type, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> createVoucher(@RequestBody @Valid VoucherRequest request) {
        ApiResponse<Void> response = voucherService.createVoucher(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateVoucher(@PathVariable Long id, @RequestBody @Valid VoucherRequest request) {
        ApiResponse<Void> response = voucherService.updateVoucher(id, request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteVoucher(@PathVariable Long id) {
        return voucherService.deleteVoucher(id);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/claim")
    public ApiResponse<Void> claimVoucher(@RequestBody @Valid UserVoucherRequest request) {
        return voucherService.claimVoucher(request);
    }
}
