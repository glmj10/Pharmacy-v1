package com.pharmacy_backend.order_service.mapper;

import com.pharmacy_backend.order_service.dto.response.UserResponse;
import com.pharmacy_backend.order_service.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toUserResponse(User user);
}
