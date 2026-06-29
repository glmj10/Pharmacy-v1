package com.pharmacy.payment_service.repository;

import com.pharmacy.payment_service.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {

    @Query(value = """
            SELECT count(*)
            FROM payment_transactions pt
            WHERE pt.order_id = :orderId AND pt.payment_status = :paymentStatus
""", nativeQuery = true)
    long existByOrderIdAndPaymentStatus(Long orderId, String paymentStatus);
}
