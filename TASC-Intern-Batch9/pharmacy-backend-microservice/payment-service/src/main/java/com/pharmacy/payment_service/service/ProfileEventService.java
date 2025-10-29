package com.pharmacy.payment_service.service;


import com.pharmacy_backend.common.kafka.event.ProfileEvent;


public interface ProfileEventService {
    void createUserProfile(ProfileEvent profileEvent);
    void updateProfile(ProfileEvent profileEvent);
    void deleteProfile(ProfileEvent profileEvent);
}
