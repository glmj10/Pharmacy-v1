package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.order_service.entity.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);
}
