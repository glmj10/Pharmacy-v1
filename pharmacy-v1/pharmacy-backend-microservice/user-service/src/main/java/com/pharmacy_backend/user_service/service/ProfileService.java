package com.pharmacy_backend.user_service.service;


import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.user_service.dto.request.ProfileRequest;
import com.pharmacy_backend.user_service.dto.response.ProfileResponse;

import java.util.List;

public interface ProfileService {
    ApiResponse<List<ProfileResponse>> getUserProfiles();
    ApiResponse<ProfileResponse> createProfile(ProfileRequest request);
    ApiResponse<ProfileResponse> updateProfile(Long id, ProfileRequest request);
    ApiResponse<Void> deleteProfile(Long id);
    ApiResponse<ProfileResponse> getProfileById(Long id);
}
