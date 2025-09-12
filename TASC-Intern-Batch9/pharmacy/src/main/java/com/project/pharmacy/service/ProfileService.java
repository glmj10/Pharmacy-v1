package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.ProfileRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ProfileResponse;

import java.util.List;

public interface ProfileService {
    ApiResponse<List<ProfileResponse>> getUserProfiles();
    ApiResponse<ProfileResponse> createProfile(ProfileRequest request);
    ApiResponse<ProfileResponse> updateProfile(Long id, ProfileRequest request);
    ApiResponse<Void> deleteProfile(Long id);
    ApiResponse<ProfileResponse> getProfileById(Long id);
}
