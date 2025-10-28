package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.request.ReserveRequest;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.ReserveResponse;

import java.util.List;

public interface StockService {
    ApiResponse<ReserveResponse> reserveProduct(List<ReserveRequest> reserveRequestList);
    void releaseReserve(List<ReserveRequest> reserveRequestList);
    void releaseStock(List<ReserveRequest> reserveRequestList);
}
