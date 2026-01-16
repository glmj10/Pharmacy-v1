package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseEntity;
import com.pharmacy_backend.common.enums.BannerTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "banners")
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Banner extends BaseEntity {
    String name;
    @Column(name = "image_url")
    String imageUrl;
    @Column(name = "image_uuid")
    String imageUUID;
    @Column(name = "target_url")
    String targetUrl;

    @Enumerated(EnumType.STRING)
    BannerTypeEnum type;
    int priority;
    @Column(name = "is_active")
    boolean isActive = true;
}
