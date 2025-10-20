package com.pharmacy_backend.blog_service.entity;

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
public class Category {
    @Id
    Long id;
    String name;
    String slug;
    @Column(name = "type_code")
    String typeCode;

    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    List<Blog> blogs = new ArrayList<>();
}
