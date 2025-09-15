package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.response.TypeResponse;
import com.project.pharmacy.entity.Type;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TypeMapper {
    TypeResponse toTypeResponse(Type type);
}
