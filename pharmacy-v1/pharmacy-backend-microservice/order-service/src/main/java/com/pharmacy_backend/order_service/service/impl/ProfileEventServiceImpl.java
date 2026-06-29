package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.kafka.event.ProfileEvent;
import com.pharmacy_backend.order_service.entity.Profile;
import com.pharmacy_backend.order_service.repository.ProfileRepository;
import com.pharmacy_backend.order_service.service.ProfileEventService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Transactional
public class ProfileEventServiceImpl implements ProfileEventService {
    final ProfileRepository profileRepository;


    @Override
    public void createUserProfile(ProfileEvent profileEvent) {
        Profile profile = Profile.builder()
                .id(profileEvent.getProfileId())
                .user_id(profileEvent.getUserId())
                .fullName(profileEvent.getFullName())
                .phoneNumber(profileEvent.getPhoneNumber())
                .address(profileEvent.getAddress())
                .build();

        profileRepository.save(profile);
    }

    @Override
    public void updateProfile(ProfileEvent profileEvent) {
        Profile profile = Profile.builder()
                .id(profileEvent.getProfileId())
                .user_id(profileEvent.getUserId())
                .fullName(profileEvent.getFullName())
                .phoneNumber(profileEvent.getPhoneNumber())
                .address(profileEvent.getAddress())
                .build();

        profileRepository.save(profile);
    }

    @Override
    public void deleteProfile(ProfileEvent profileEvent) {
        Profile profile = Profile.builder()
                .id(profileEvent.getProfileId())
                .user_id(profileEvent.getUserId())
                .fullName(profileEvent.getFullName())
                .phoneNumber(profileEvent.getPhoneNumber())
                .address(profileEvent.getAddress())
                .build();

        profileRepository.delete(profile);
    }
}
