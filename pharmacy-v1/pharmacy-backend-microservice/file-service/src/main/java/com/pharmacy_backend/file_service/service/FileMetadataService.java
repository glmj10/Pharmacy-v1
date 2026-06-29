package com.pharmacy_backend.file_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import org.springframework.core.io.FileSystemResource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface FileMetadataService {
    ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category);
    FileSystemResource downloadFile(String uuidStr);
    void deleteFile(String uuidStr);
    FileSystemResource loadFile(String uuidStr);
    ApiResponse<List<FileMetadataResponse>> storeFile(List<MultipartFile> multipartFiles, String category);
    ApiResponse<Boolean> checkFileExists(String uuidStr);
    ApiResponse<String> getFileUrl(String uuidStr);
}
