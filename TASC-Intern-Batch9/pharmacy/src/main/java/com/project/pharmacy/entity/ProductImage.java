package com.project.pharmacy.entity;


import com.project.pharmacy.entity.base.BaseEntity;
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
    @Column(name = "image_uuid")
    String imageUUID;
    String url;

    @ManyToOne
    @JoinColumn(name = "product_id")
    Product product;
}
