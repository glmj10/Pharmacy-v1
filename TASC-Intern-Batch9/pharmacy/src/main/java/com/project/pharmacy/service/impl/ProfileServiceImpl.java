package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.request.ProfileRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ProfileResponse;
import com.project.pharmacy.entity.Profile;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.ProfileMapper;
import com.project.pharmacy.repository.ProfileRepository;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.ProfileService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProfileServiceImpl implements ProfileService {
    ProfileRepository profileRepository;
    ProfileMapper profileMapper;
    UserRepository userRepository;
    @Override
    public ApiResponse<List<ProfileResponse>> getUserProfiles() {
        List<Profile> profiles = profileRepository.findByUser_Id(SecurityUtils.getCurrentUserId());
        List<ProfileResponse> responses = profiles.stream().map(
            profileMapper::toProfileResponse
        ).toList();

        return ApiResponse.buildOkResponse(responses, "Lấy danh sách địa chỉ thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProfileResponse> createProfile(ProfileRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(Objects.requireNonNull(currentUserId))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        Integer profileCount = profileRepository.countProfileByUser(user);
        if (profileCount >= 5) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST, "Mỗi người dùng chỉ được tạo tối đa 5 địa chỉ");
        }
        Profile profile = profileMapper.toProfile(request);
        profile.setUser(user);
        profile = profileRepository.save(profile);
        ProfileResponse response = profileMapper.toProfileResponse(profile);

        return ApiResponse.buildCreatedResponse(
                response,
                "Tạo địa chỉ thành công"
        );
    }

    @Transactional
    @Override
    public ApiResponse<ProfileResponse> updateProfile(Long id, ProfileRequest request) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new CustomException(ErrorCode.FORBIDDEN,
                    HttpStatus.FORBIDDEN, "Bạn không có quyền cập nhật địa chỉ này");
        }

        Profile updatedProfile = profileMapper.updateProfileFromRequest(request, profile);
        profile = profileRepository.save(updatedProfile);
        ProfileResponse response = profileMapper.toProfileResponse(profile);

        return ApiResponse.buildOkResponse(response, "Cập nhật địa chỉ thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteProfile(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new CustomException(ErrorCode.FORBIDDEN,
                    HttpStatus.FORBIDDEN, "Bạn không có quyền xóa địa chỉ này");
        }

        profileRepository.delete(profile);

        return ApiResponse.buildOkResponse(null, "Xóa địa chỉ thành công");
    }

    @Override
    public ApiResponse<ProfileResponse> getProfileById(Long id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PROFILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Địa chỉ không tồn tại"));

        if (!profile.getUser().getId().equals(SecurityUtils.getCurrentUserId())) {
            throw new CustomException(ErrorCode.FORBIDDEN,
                    HttpStatus.FORBIDDEN, "Bạn không có quyền xem địa chỉ này");
        }

        ProfileResponse response = profileMapper.toProfileResponse(profile);

        return ApiResponse.buildOkResponse(response, "Lấy thông tin địa chỉ thành công");
    }
}
