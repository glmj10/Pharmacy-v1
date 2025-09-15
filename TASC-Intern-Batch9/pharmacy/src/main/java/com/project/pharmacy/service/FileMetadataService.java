package com.project.pharmacy.service;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.FileMetadataResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.multipart.MultipartFile;

public interface FileMetadataService {
    ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category);
    FileSystemResource downloadFile(String uuidStr);
    void deleteFile(String uuidStr);
    FileSystemResource loadFile(String uuidStr);
}
