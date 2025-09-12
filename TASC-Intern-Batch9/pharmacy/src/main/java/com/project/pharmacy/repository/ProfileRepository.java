package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Profile;
import com.project.pharmacy.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Long> {
    List<Profile> findByUser_Id(Long userId);

    Optional<Profile> findByUserAndId(User user, Long id);

    Integer countProfileByUser(User user);
}
