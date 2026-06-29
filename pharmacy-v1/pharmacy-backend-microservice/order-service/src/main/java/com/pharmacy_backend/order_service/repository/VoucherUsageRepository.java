package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.order_service.entity.VoucherUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherUsageRepository extends JpaRepository<VoucherUsage, Long> {
    VoucherUsage findByOrderIdAndVoucherId(Long id, Long id1);

    boolean existsVoucherUsageByVoucherIdAndUserId(Long voucherId, Long userId);
}
