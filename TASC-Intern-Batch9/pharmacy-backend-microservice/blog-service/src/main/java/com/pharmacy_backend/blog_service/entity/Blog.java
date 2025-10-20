package com.pharmacy_backend.blog_service.entity;

import com.pharmacy_backend.common.entity.base.BaseModifyEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Table(name = "blogs")
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class Blog extends BaseModifyEntity {
    String title;
    String slug;
    String thumbnail;
    Integer priority = 0;

    @JoinColumn(name = "category_id")
    @ManyToOne
    Category category;

    @Column(columnDefinition = "TEXT")
    String content;

}
