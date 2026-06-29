package com.pharmacy_backend.product_service.entity;


import com.pharmacy_backend.common.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "product_images")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductImage extends BaseEntity {
    @Column(name = "image_url", columnDefinition = "TEXT")
    String imageUrl;

    @Column(name = "image_uuid")
    String imageUUID;

    @ManyToOne
    @JoinColumn(name = "product_id")
    Product product;
}
