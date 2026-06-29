package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@NoArgsConstructor
@Table(name = "stocks")
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Stock extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    Product product;
    Long reservedStock = 0L;

    public void increaseReservedStock(Long quantity) {
        this.reservedStock += quantity;
    }

    public void decreaseReservedStock(Long quantity) {
        this.reservedStock -= quantity;
        if (this.reservedStock < 0) {
            this.reservedStock = 0L;
        }
    }

    public Stock(Product product) {
        this.product = product;
    }
}