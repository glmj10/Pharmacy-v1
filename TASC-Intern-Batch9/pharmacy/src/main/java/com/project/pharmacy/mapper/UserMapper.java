package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.UserRequest;
import com.project.pharmacy.dto.response.UserResponse;
import com.project.pharmacy.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "tokenVersion", ignore = true)
    @Mapping(target = "roles", ignore = true)
    User toUser(UserRequest request);

    UserResponse toUserResponse(User user);

}
