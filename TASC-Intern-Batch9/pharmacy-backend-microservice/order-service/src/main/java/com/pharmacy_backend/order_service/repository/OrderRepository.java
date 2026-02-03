package com.pharmacy_backend.order_service.repository;

import com.pharmacy_backend.common.enums.OrderStatusEnum;
import com.pharmacy_backend.order_service.dto.projection.RevenueStatisticProjection;
import com.pharmacy_backend.order_service.dto.projection.TotalOrderStatusProjection;
import com.pharmacy_backend.order_service.entity.Order;
import com.pharmacy_backend.order_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface OrderRepository extends JpaRepository<Order, Long>, JpaSpecificationExecutor<Order> {
    Page<Order> findByUser(User user, Pageable pageable);

    @Query(value = "SELECT SUM(o.total_price) FROM orders o " +
            "WHERE o.order_status = :orderStatus " +
            "AND o.payment_status = :paymentStatus",
            nativeQuery = true)
    Long getTotalRevenue(@Param("orderStatus") String orderStatus, @Param("paymentStatus") String paymentStatus);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    Page<Order> findByUserAndStatus(User user, OrderStatusEnum orderStatus, Pageable pageable);

    @Query(value = "CALL sp_cancel_pending_orders(:minutesThreshold)", nativeQuery = true)
    Integer cancelPendingOrders(@Param("minutesThreshold") int minutesThreshold);

    @Query(value = """
            SELECT 
                DATE(o.created_at) AS date,
                SUM(o.total_price) AS totalRevenue,
                COUNT(o.id) AS orderCount
            FROM 
                orders o
            WHERE 
                o.created_at BETWEEN :startDate AND :endDate
                AND o.order_status = 'DELIVERED'
                AND o.payment_status = 'COMPLETED'
            GROUP BY 
                DATE(o.created_at)
            ORDER BY 
                DATE(o.created_at) ASC
            """,
            nativeQuery = true)
    List<RevenueStatisticProjection> getRevenueStatistics(@Param("startDate") LocalDateTime startDate,
                                                          @Param("endDate") LocalDateTime endDate);

    @Query(value = """
        SELECT 
            DATE(o.created_at) AS date,
            -- Cast về SIGNED để tránh lỗi type mapping với Long trong Java
            CAST(SUM(o.total_price) AS SIGNED) AS totalRevenue,
            COUNT(o.id) AS orderCount
        FROM 
            orders o
        WHERE 
            DATE(o.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL :days DAY) AND CURDATE()
            AND o.order_status = 'DELIVERED'
            AND o.payment_status = 'COMPLETED'
        GROUP BY 
            DATE(o.created_at) -- <--- BẮT BUỘC PHẢI CÓ DÒNG NÀY
        ORDER BY 
            date ASC
""", nativeQuery = true)
    List<RevenueStatisticProjection> getRevenueStatisticsByDate(@Param("days") Integer days);

    @Query(value = """
    SELECT 
        -- Sử dụng %v (Tuần 01-53) và %x (Năm chuẩn của tuần đó)
        -- Kết quả sẽ ra: "W12/2024"
        DATE_FORMAT(o.created_at, 'W%v/%x') AS date,
        
        CAST(SUM(o.total_price) AS SIGNED) AS totalRevenue,
        COUNT(o.id) AS orderCount
    FROM 
        orders o
    WHERE 
        DATE(o.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL :days DAY) AND CURDATE()
        AND o.order_status = 'DELIVERED'
        AND o.payment_status = 'COMPLETED'
    GROUP BY 
        -- Group By chính cái chuỗi đã format -> MySQL hiểu ngay lập tức
        DATE_FORMAT(o.created_at, 'W%v/%x'),
        DATE_FORMAT(o.created_at, '%x%v')
    ORDER BY 
        -- Sắp xếp theo Năm-Tuần (dùng %x%v để sort string cho đúng thứ tự số)
        DATE_FORMAT(o.created_at, '%x%v') ASC
    """, nativeQuery = true)
    List<RevenueStatisticProjection> getRevenueStatisticsByWeek(@Param("days") int days);

    @Query(value = """
    SELECT 
        -- Map vào getDate(): Format dạng "2024-02"
        DATE_FORMAT(o.created_at, '%Y-%m') AS date,
        
        CAST(SUM(o.total_price) AS SIGNED) AS totalRevenue,
        COUNT(o.id) AS orderCount
    FROM 
        orders o
    WHERE 
        DATE(o.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL :days DAY) AND CURDATE()
        AND o.order_status = 'DELIVERED'
        AND o.payment_status = 'COMPLETED'
    GROUP BY 
        DATE_FORMAT(o.created_at, '%Y-%m') -- Group theo Tháng-Năm
    ORDER BY 
        date ASC
    """, nativeQuery = true)
    List<RevenueStatisticProjection> getRevenueStatisticsByMonth(@Param("days") Integer days);

    @Query(value = """
    SELECT 
        -- Map vào getDate(): Format dạng "2024"
        DATE_FORMAT(o.created_at, '%Y') AS date,
        
        CAST(SUM(o.total_price) AS SIGNED) AS totalRevenue,
        COUNT(o.id) AS orderCount
    FROM 
        orders o
    WHERE 
        DATE(o.created_at) BETWEEN DATE_SUB(CURDATE(), INTERVAL :days DAY) AND CURDATE()
        AND o.order_status = 'DELIVERED'
        AND o.payment_status = 'COMPLETED'
    GROUP BY 
        DATE_FORMAT(o.created_at, '%Y')
    ORDER BY 
        date ASC
    """, nativeQuery = true)
    List<RevenueStatisticProjection> getRevenueStatisticsByYear(@Param("days") int days);

    @Query(value = """
            SELECT order_status as status, COUNT(*) as count FROM orders group by  order_status;
            """, nativeQuery = true
    )
    List<TotalOrderStatusProjection> getTotalOrderStatus();
}
