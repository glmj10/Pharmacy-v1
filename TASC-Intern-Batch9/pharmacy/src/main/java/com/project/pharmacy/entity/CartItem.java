package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "cart_items")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem extends BaseEntity {
    Integer quantity;
    Boolean selected = false;
    @Column(name = "total_price")
    Long totalPrice = 0L;
    @Column(name = "price_at_addition")
    Integer priceAtAddition = 0;

    @ManyToOne
    @JoinColumn(name = "product_id", referencedColumnName = "id")
    Product product;

    @ManyToOne
    @JoinColumn(name = "cart_id")
    Cart cart;

    public boolean isOutOfStock() {
        return this.product.getQuantity() < this.quantity;
    }

    public boolean isSelected() {
        return this.selected != null && this.selected;
    }
}
