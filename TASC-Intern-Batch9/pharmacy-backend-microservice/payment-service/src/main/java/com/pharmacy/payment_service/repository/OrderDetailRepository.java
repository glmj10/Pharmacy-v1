package com.pharmacy.payment_service.repository;

import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.OrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long> {
    Optional<List<OrderDetail>> findByOrder(Order order);
}
