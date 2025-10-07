package com.pharmacy_backend.identity_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.exceptions.ValidationException;
import com.pharmacy_backend.identity_service.dto.request.RoleRequest;
import com.pharmacy_backend.identity_service.dto.response.RoleResponse;
import com.pharmacy_backend.identity_service.entity.Role;
import com.pharmacy_backend.identity_service.mapper.RoleMapper;
import com.pharmacy_backend.identity_service.repository.RoleRepository;
import com.pharmacy_backend.identity_service.service.RoleService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public ApiResponse<RoleResponse> getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ROLE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Vai trò không tồn tại"));
        RoleResponse response = roleMapper.toRoleResponse(role);
        return ApiResponse.buildOkResponse(response, "Lấy thông tin vai trò thành công");
    }

    @Override
    public ApiResponse<List<RoleResponse>> getAllRoles(String code, String name) {
        List<Role> roles;
        if (code != null && !code.isBlank()) {
            roles = roleRepository.findByCodeContainingIgnoreCase(code);
        } else if (name != null && !name.isBlank()) {
            roles = roleRepository.findByNameContainingIgnoreCase(name);
        } else {
            roles = roleRepository.findAll();
        }

        List<RoleResponse> responses = roles.stream()
                .map(roleMapper::toRoleResponse)
                .collect(Collectors.toList());
        return ApiResponse.buildOkResponse(responses, "Lấy danh sách vai trò thành công");
    }

    @Transactional
    @Override
    public ApiResponse<RoleResponse> createRole(RoleRequest request) {
        checkRoleExists(request.getCode(), request.getName());

        Role role = roleMapper.toRole(request);

        Role savedRole = roleRepository.save(role);
        RoleResponse response = roleMapper.toRoleResponse(savedRole);
        return ApiResponse.buildOkResponse(response, "Tạo vai trò thành công");
    }

    @Transactional
    @Override
    public ApiResponse<RoleResponse> updateRole(Long id, RoleRequest request) {
        Role existingRole = roleRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.ROLE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Vai trò không tồn tại"));

        if(!request.getCode().equals(existingRole.getCode()) || !request.getName().equals(existingRole.getName())) {
            checkRoleExists(request.getCode(), request.getName());
        }

        Role updatedRole = roleRepository.save(roleMapper.toRoleUpdateFromRequest(request, existingRole));
        RoleResponse response = roleMapper.toRoleResponse(updatedRole);
        return ApiResponse.buildOkResponse(response, "Cập nhật vai trò thành công");
    }

    private void checkRoleExists(String code, String name) {
        if (roleRepository.existsByCode(code)) {
            throw new ValidationException("code", ErrorCode.ROLE_ALREADY_EXISTS.getMessage(), code);
        }

        if (roleRepository.existsByName(name)) {
            throw new ValidationException("name", ErrorCode.ROLE_ALREADY_EXISTS.getMessage(), name);
        }
    }

}
