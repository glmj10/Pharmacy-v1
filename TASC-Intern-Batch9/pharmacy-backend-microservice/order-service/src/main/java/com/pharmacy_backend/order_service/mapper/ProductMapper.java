package com.pharmacy_backend.order_service.mapper;

import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.order_service.dto.response.ProductResponse;
import com.pharmacy_backend.order_service.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponse toProductResponse(Product product);

    @Mapping(target = "id", source = "productEvent.productId")
    Product toProduct(ProductEvent productEvent);
}
