package com.pharmacy_backend.product_service.entity;

import com.pharmacy_backend.common.entity.base.BaseModifyEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "categories")
@NoArgsConstructor
@AllArgsConstructor
public class Category extends BaseModifyEntity {
    String name;
    Integer priority = 0;
    String slug;

    @Column(columnDefinition = "TEXT")
    String thumbnail;

    @Column(name = "thumbnail_uuid")
    String thumbnailUUID;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "parent")
    List<Category> child = new ArrayList<>();

    @ManyToMany(mappedBy = "categories", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    List<Product> products = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "parent_id")
    Category parent;

    @ManyToOne
    @JoinColumn(name = "type_id")
    Type type;
}
