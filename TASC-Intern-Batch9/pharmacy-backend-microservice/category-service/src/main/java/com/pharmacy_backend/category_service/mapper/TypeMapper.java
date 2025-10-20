package com.pharmacy_backend.category_service.mapper;

import com.project.pharmacy.dto.response.TypeResponse;
import com.project.pharmacy.entity.Type;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TypeMapper {
    TypeResponse toTypeResponse(Type type);
}
