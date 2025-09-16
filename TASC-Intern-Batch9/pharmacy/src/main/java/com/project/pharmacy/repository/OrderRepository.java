package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.Order;
import com.project.pharmacy.enums.OrderStatusEnum;
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
    Page<Order> findByCart(Cart cart, Pageable pageable);

    @Query(value = "SELECT SUM(o.total_price) FROM orders o " +
            "WHERE o.order_status = :orderStatus " +
            "AND o.payment_status = :paymenStatus",
            nativeQuery = true)
    Long getTotalRevenue(@Param("orderStatus") String orderStatus, @Param("paymenStatus") String paymenStatus);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    Page<Order> findByCartAndStatus(Cart cart, OrderStatusEnum orderStatus, Pageable pageable);
}
