package com.project.pharmacy.entity;

import com.project.pharmacy.entity.base.BaseModifyEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
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

    @ManyToOne
    Category category;

    @Column(columnDefinition = "TEXT")
    String content;

}
