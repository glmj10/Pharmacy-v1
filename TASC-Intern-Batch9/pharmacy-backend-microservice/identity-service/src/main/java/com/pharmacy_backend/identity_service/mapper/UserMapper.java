package com.pharmacy_backend.identity_service.mapper;

import com.pharmacy_backend.identity_service.dto.request.UserRequest;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import com.pharmacy_backend.identity_service.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tokenVersion", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "profilePic", ignore = true)
    User toUser(UserRequest request);

    UserResponse toUserResponse(User user);

}
