package com.pharmacy_backend.product_service.mapper;

import com.pharmacy_backend.product_service.dto.request.BannerRequest;
import com.pharmacy_backend.product_service.dto.response.BannerResponse;
import com.pharmacy_backend.product_service.entity.Banner;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    Banner toBanner(BannerRequest request);

    BannerResponse toBannerResponse(Banner banner);

    Banner toBannerUpdateFromRequest(BannerRequest request, @MappingTarget Banner existingBanner);
}
