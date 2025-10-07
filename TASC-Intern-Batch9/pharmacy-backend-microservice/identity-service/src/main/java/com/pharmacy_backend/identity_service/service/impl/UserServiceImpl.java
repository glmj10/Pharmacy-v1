package com.pharmacy_backend.identity_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.identity_service.dto.request.ChangeUserRoleRequest;
import com.pharmacy_backend.identity_service.dto.request.UserSearchCriteria;
import com.pharmacy_backend.identity_service.dto.response.UserResponse;
import com.pharmacy_backend.identity_service.dto.response.PageResponse;
import com.pharmacy_backend.identity_service.entity.Role;
import com.pharmacy_backend.identity_service.entity.User;
import com.pharmacy_backend.identity_service.mapper.UserMapper;
import com.pharmacy_backend.identity_service.repository.RoleRepository;
import com.pharmacy_backend.identity_service.repository.UserRepository;
import com.pharmacy_backend.identity_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;
//    private final FileMetadataRepository fileMetadataRepository;

    @Override
    public ApiResponse<UserResponse> changeUserRole(Long userId, ChangeUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        if(Objects.equals(SecurityUtils.getCurrentUserId(), userId)) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST, "Người dùng không thể thay đổi vai trò của chính mình");
        }

        List<String> validRoleCodes = roleRepository.findAll().stream()
                .map(Role::getCode)
                .toList();

        if (request.getRoleCodes() == null || request.getRoleCodes().isEmpty()) {
            throw new CustomException(
                    ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST,
                    "Danh sách vai trò không được để trống"
            );
        }

        for (String roleCode : request.getRoleCodes()) {
            if (roleCode == null || roleCode.isBlank()) {
                throw new CustomException(
                        ErrorCode.INVALID_ROLE,
                        HttpStatus.BAD_REQUEST,
                        "Vai trò không được null hoặc rỗng"
                );
            }
            if (!validRoleCodes.contains(roleCode.toUpperCase())) {
                throw new CustomException(
                        ErrorCode.INVALID_ROLE,
                        HttpStatus.BAD_REQUEST,
                        "Vai trò không hợp lệ: " + roleCode
                );
            }
        }

        List<Role> roles = roleRepository.findByCodeIn(request.getRoleCodes());
        if (roles.size() != request.getRoleCodes().size()) {
            throw new CustomException(ErrorCode.ROLE_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Một số vai trò không tồn tại");
        }

        user.setRoles(new HashSet<>(roles));
        user.setTokenVersion(user.getTokenVersion() + 1);
        User updatedUser = userRepository.save(user);
        UserResponse userResponse = userMapper.toUserResponse(updatedUser);
        return ApiResponse.buildOkResponse(userResponse, "Cập nhật vai trò người dùng thành công");
    }

    @Override
    public ApiResponse<UserResponse> getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        UserResponse userResponse = userMapper.toUserResponse(user);
//        userResponse.setProfilePicUrl(getProfilePicUrl(user.getProfilePic()));
        return ApiResponse.buildOkResponse(userResponse, "Lấy thông tin người dùng thành công");
    }

    @Override
    public ApiResponse<PageResponse<List<UserResponse>>> getAllUsers(Integer pageIndex,
                                                                     Integer pageSize, UserSearchCriteria criteria) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<User> userPage = userRepository.searchUsers(criteria, pageable);

        List<UserResponse> userResponses = userPage.getContent().stream().map(user -> {
            UserResponse userResponse = userMapper.toUserResponse(user);
//            userResponse.setProfilePicUrl(getProfilePicUrl(user.getProfilePic()));
            return userResponse;
        }).toList();
        PageResponse<List<UserResponse>> pageResponse = PageResponse.<List<UserResponse>>builder()
                .content(userResponses)
                .currentPage(pageIndex)
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .hasNext(userPage.hasNext())
                .hasPrevious(userPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách người dùng thành công");
    }

    @Override
    public ApiResponse<UserResponse> getCurrentUser() {
        User currentUser = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        UserResponse userResponse = userMapper.toUserResponse(currentUser);
//        userResponse.setProfilePicUrl(getProfilePicUrl(currentUser.getProfilePic()));
        userResponse.setRoles(null);
        return ApiResponse.buildOkResponse(userResponse, "Lấy thông tin người dùng thành công");
    }

    @Override
    public ApiResponse<Long> getTotalUser() {
        Long totalUsers = userRepository.count();
        return ApiResponse.buildOkResponse(totalUsers, "Lấy tổng số người dùng thành công");
    }

//    private String getProfilePicUrl(String profilePic) {
//        if (profilePic == null || profilePic.isEmpty()) {
//            return null;
//        }
//        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(profilePic))
//                .orElse(null);
//        return fileMetadata != null ? fileMetadata.getUrl() : null;
//    }
}
