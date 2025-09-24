package com.pharmacy_backend.common.entity.base;


import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseModifyEntity extends BaseEntity {
    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @CreatedBy
    @Column(name = "created_by", nullable = false)
    Long createdBy;

    @CreationTimestamp
    @LastModifiedDate
    @Column(name = "modified_at")
    LocalDateTime modifiedAt;

    @LastModifiedBy
    @Column(name = "modified_by")
    Long modifiedBy;
}
