package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.order_service.entity.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);

    Optional<UserVoucher> findByUserIdAndVoucherId(Long id, Long id1);
}
