package com.project.pharmacy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Entity
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(name = "file_meta_data")
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadata {
    @Id
    @Column(name = "uuid", nullable = false, unique = true)
    UUID uuid = UUID.randomUUID();

    @Column(name = "original_file_name", nullable = false)
    String originalFileName;

    @Column(name = "stored_file_name", nullable = false)
    String storedFileName;

    String url;

    @Column(name = "file_extension", nullable = false)
    String fileExtension;

    @Column(name = "file_size", nullable = false)
    long fileSize;

    @Column(name = "content_type", nullable = false)
    String contentType;

    @Column(name = "file_type", nullable = false)
    String fileType;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    LocalDateTime createdAt;
}
