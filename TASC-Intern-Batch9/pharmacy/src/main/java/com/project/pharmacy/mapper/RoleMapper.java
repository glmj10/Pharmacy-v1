package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.RoleRequest;
import com.project.pharmacy.dto.response.RoleResponse;
import com.project.pharmacy.entity.Role;
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
