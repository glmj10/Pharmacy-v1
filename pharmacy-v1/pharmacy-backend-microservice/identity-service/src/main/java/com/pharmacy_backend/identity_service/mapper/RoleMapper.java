package com.pharmacy_backend.identity_service.mapper;

import com.pharmacy_backend.identity_service.dto.request.RoleRequest;
import com.pharmacy_backend.identity_service.dto.response.RoleResponse;
import com.pharmacy_backend.identity_service.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface RoleMapper {

    @Mapping(target = "id", ignore = true)
    Role toRole(RoleRequest request);

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "id", ignore = true)
    Role toRoleUpdateFromRequest(RoleRequest request, @MappingTarget Role role);
}
