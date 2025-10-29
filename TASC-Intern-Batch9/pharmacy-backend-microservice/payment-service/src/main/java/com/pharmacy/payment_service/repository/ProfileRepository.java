package com.pharmacy.payment_service.repository;

import com.pharmacy_backend.order_service.entity.Profile;
import com.pharmacy_backend.order_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {

    @Query("SELECT p FROM Profile p" +
            " WHERE p.user_id = :userId AND p.id = :profileId")
    Optional<Profile> findUserProfile(Long userId, Long profileId);
}
