package com.pharmacy.payment_service.repository;

import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findByUser(User user, Pageable pageable);

    @Query(value = "SELECT SUM(o.total_price) FROM orders o " +
            "WHERE o.order_status = :orderStatus " +
            "AND o.payment_status = :paymenStatus",
            nativeQuery = true)
    Long getTotalRevenue(@Param("orderStatus") String orderStatus, @Param("paymenStatus") String paymenStatus);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    Page<Order> findByUserAndStatus(User user, OrderStatusEnum orderStatus, Pageable pageable);

    @Query(value = "CALL sp_cancel_pending_orders(:minutesThreshold)", nativeQuery = true)
    Integer cancelPendingOrders(@Param("minutesThreshold") int minutesThreshold);
}
