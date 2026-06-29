package com.pharmacy_backend.order_service.mapper;

import com.pharmacy_backend.order_service.dto.request.VoucherRequest;
import com.pharmacy_backend.order_service.dto.response.VoucherResponse;
import com.pharmacy_backend.order_service.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface VoucherMapper {

    Voucher toVoucher(VoucherRequest request);

    VoucherResponse toVoucherResponse(Voucher voucher);

    Voucher toVoucherUpdateFromRequest(VoucherRequest request, @MappingTarget Voucher voucher);
}
