package com.pharmacy_backend.user_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.enums.PartitionKeyEnum;
import com.pharmacy_backend.common.enums.TopicEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.ProfileEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.user_service.dto.request.ProfileRequest;
import com.pharmacy_backend.user_service.dto.response.ProfileResponse;
import com.pharmacy_backend.user_service.entity.OutboxEvent;
import com.pharmacy_backend.user_service.entity.Profile;
import com.pharmacy_backend.user_service.entity.User;
import com.pharmacy_backend.user_service.mapper.ProfileMapper;
import com.pharmacy_backend.user_service.repository.OutboxEventRepository;
import com.pharmacy_backend.user_service.repository.ProfileRepository;
import com.pharmacy_backend.user_service.repository.UserRepository;
import com.pharmacy_backend.user_service.service.ProfileService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileServiceImpl implements ProfileService {
    final ProfileRepository profileRepository;
    final ProfileMapper profileMapper;
    final UserRepository userRepository;
    final OutboxEventRepository outboxEventRepository;
    final ObjectMapper objectMapper;

    @Value("${spring.application.name}")
    String appName;

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

        ProfileEvent profileEvent = ProfileEvent.builder()
                .profileId(profile.getId())
                .userId(user.getId())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .build();

        Event<ProfileEvent> profileEventEvent = Event.<ProfileEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PROFILE.getName(), profile.getId()))
                .eventType(EventTypeEnum.PROFILE_CREATED.getName())
                .source(appName)
                .data(profileEvent)
                .build();

        handleSaveProfileEvent(profileEventEvent);

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

        ProfileEvent profileEvent = ProfileEvent.builder()
                .profileId(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .build();

        Event<ProfileEvent> profileEventEvent = Event.<ProfileEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PROFILE.getName(), profile.getId()))
                .eventType(EventTypeEnum.PROFILE_UPDATED.getName())
                .source(appName)
                .data(profileEvent)
                .build();

        handleSaveProfileEvent(profileEventEvent);

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

        ProfileEvent profileEvent = ProfileEvent.builder()
                .profileId(profile.getId())
                .userId(profile.getUser().getId())
                .fullName(profile.getFullName())
                .phoneNumber(profile.getPhoneNumber())
                .address(profile.getAddress())
                .build();

        Event<ProfileEvent> profileEventEvent = Event.<ProfileEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PROFILE.getName(), profile.getId()))
                .eventType(EventTypeEnum.PROFILE_DELETED.getName())
                .source(appName)
                .data(profileEvent)
                .build();

        handleSaveProfileEvent(profileEventEvent);

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

    private void handleSaveProfileEvent(Event<ProfileEvent> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.PROFILE.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.PROFILE_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxEventRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }
}
