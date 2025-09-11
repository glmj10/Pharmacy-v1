package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseModifyEntity;
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

    @ManyToMany(mappedBy = "categories", cascade = {CascadeType.DETACH, CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH})
    List<Product> products = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "category")
    List<Blog> blogs = new ArrayList<>();

    @OneToMany(fetch = FetchType.LAZY, cascade = CascadeType.ALL, mappedBy = "parent")
    List<Category> child = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "parent_id")
    Category parent;

    @OneToOne
    @JoinColumn(name = "type_id")
    Type type;
}
