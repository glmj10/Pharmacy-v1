package com.pharmacy_backend.order_service.mapper;

import com.pharmacy_backend.order_service.dto.request.RateRequest;
import com.pharmacy_backend.order_service.dto.response.RateResponse;
import com.pharmacy_backend.order_service.entity.Rate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RateMapper {

    Rate toRate(RateRequest request);

    RateResponse toRateResponse(Rate rate);
}
