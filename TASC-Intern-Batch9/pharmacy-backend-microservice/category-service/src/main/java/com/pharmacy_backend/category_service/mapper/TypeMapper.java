package com.pharmacy_backend.category_service.mapper;

import com.pharmacy_backend.category_service.dto.response.TypeResponse;
import com.pharmacy_backend.category_service.entity.Type;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TypeMapper {
    TypeResponse toTypeResponse(Type type);
}
