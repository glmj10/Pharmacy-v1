package com.project.pharmacy.controller;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.FileMetadataResponse;
import com.project.pharmacy.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/files")
public class FileController {
    private final FileMetadataService fileMetadataService;

    @PostMapping("/upload/{category}")
    public ResponseEntity<ApiResponse<FileMetadataResponse>> uploadFile(@PathVariable String category,
                                                                        @RequestPart("file") MultipartFile file) {
        ApiResponse<FileMetadataResponse> response = fileMetadataService.storeFile(file, category);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/download/{uuid}")
    public ResponseEntity<FileSystemResource> downloadFile(@PathVariable String uuid) {
        FileSystemResource resource = fileMetadataService.downloadFile(uuid);
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/jpeg"))
                .body(resource);
    }

    @GetMapping("/load/{uuid}")
    public ResponseEntity<FileSystemResource> loadFile(@PathVariable String uuid) {
        FileSystemResource resource = fileMetadataService.loadFile(uuid);
        return ResponseEntity.ok().
                contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
