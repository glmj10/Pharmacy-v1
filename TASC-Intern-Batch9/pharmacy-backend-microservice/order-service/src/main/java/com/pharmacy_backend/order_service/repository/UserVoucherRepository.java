package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.order_service.dto.projection.VoucherStatusInfoProjection;
import com.pharmacy_backend.order_service.entity.UserVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Long> {

    boolean existsByUserIdAndVoucherId(Long userId, Long voucherId);

    // UserVoucherRepository.java
    @Query("SELECT uv.voucherId FROM UserVoucher uv " +
            "WHERE uv.userId = :userId AND uv.voucherId IN :voucherIds")
    Set<Long> findClaimedVoucherIds(@Param("userId") Long userId,
                                    @Param("voucherIds") List<Long> voucherIds);

    void deleteByUserIdAndVoucherId(Long id, Long voucherId);

    UserVoucher findByUserIdAndVoucherId(Long id, Long voucherId);

    @Query("SELECT uv.voucherId AS voucherId, uv.isUsed AS used " +
            "FROM UserVoucher uv " +
            "WHERE uv.userId = :currentUserId AND uv.voucherId IN :claimIds")
    List<VoucherStatusInfoProjection> findUsedStatus(@Param("currentUserId") Long currentUserId,
                                                     @Param("claimIds") Set<Long> claimIds);
}