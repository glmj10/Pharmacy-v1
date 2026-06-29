package com.pharmacy_backend.common.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FileMetadataResponse {
    private UUID id;
    private String storedFileName;
    private String path;
}
