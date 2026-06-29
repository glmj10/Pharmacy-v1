package com.pharmacy_backend.order_service.specification;

import com.pharmacy_backend.order_service.entity.Voucher;
import org.springframework.data.jpa.domain.Specification;

public class VoucherSpecification {
    public static Specification<Voucher> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null || status.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    public static Specification<Voucher> hasType(String type) {
        return (root, query, criteriaBuilder) -> {
            if (type == null || type.isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("type"), type);
        };
    }
}
