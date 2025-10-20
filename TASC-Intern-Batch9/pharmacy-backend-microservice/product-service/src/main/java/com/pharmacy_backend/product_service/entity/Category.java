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
    String thumbnail;

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "parent")
    List<Category> child = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "parent_id")
    Category parent;

    @ManyToOne
    @JoinColumn(name = "type_id")
    Type type;
}
