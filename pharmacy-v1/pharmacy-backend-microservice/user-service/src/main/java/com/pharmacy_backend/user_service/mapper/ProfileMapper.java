package com.pharmacy_backend.user_service.mapper;

import com.pharmacy_backend.user_service.dto.request.ProfileRequest;
import com.pharmacy_backend.user_service.dto.response.ProfileResponse;
import com.pharmacy_backend.user_service.entity.Profile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Profile toProfile(ProfileRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    Profile updateProfileFromRequest(ProfileRequest request, @MappingTarget Profile profile);

    ProfileResponse toProfileResponse(Profile profile);
}
