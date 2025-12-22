package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.common.enums.VoucherTypeEnum;
import com.pharmacy_backend.order_service.entity.Voucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {
    Page<Voucher> findAll(Pageable pageable);

    Page<Voucher> findByType(VoucherTypeEnum type, Pageable pageable);

    @Modifying
    @Query("UPDATE Voucher v SET v.collectedCount = v.collectedCount + 1 " +
            "WHERE v.id = :id AND v.collectedCount < v.usageLimit")
    int increaseCollectedCount(@Param("id") Long id);

    @Query("""
    SELECT v
    FROM Voucher v
    LEFT JOIN UserVoucher uv ON v.id = uv.voucherId
    WHERE uv.userId = :userId
      AND (:type IS NULL OR v.type = :type)
""")
    Page<Voucher> findUserVouchersByType(
            @Param("userId") Long userId,
            @Param("type") VoucherTypeEnum type,
            Pageable pageable
    );


}
