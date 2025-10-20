package com.pharmacy_backend.cart_service.mapper;

import com.pharmacy_backend.cart_service.dto.response.ProductResponse;
import com.pharmacy_backend.cart_service.entity.Product;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    ProductResponse toProductResponse(Product product);

    @Mapping(target = "id", source = "productEvent.productId")
    Product toProduct(ProductEvent productEvent);
}
