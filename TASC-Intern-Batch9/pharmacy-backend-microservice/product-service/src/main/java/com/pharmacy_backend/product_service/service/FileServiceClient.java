package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.product_service.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@FeignClient(name = "${file.service.name:file-service}", url = "http://localhost:6969", configuration = FeignClientConfig.class)
public interface FileServiceClient {
    @PostMapping(value = "/files/upload/{category}", consumes = "multipart/form-data")
    ApiResponse<FileMetadataResponse> uploadFile(@RequestPart("file") MultipartFile file, @PathVariable String category);

    @PostMapping(value = "/files/upload-multiple/{category}", consumes = "multipart/form-data")
    ApiResponse<List<FileMetadataResponse>> uploadMultipleFiles(@RequestPart("files") List<MultipartFile> files,
                                                                @PathVariable String category);

    @DeleteMapping(value = "/files/delete")
    void deleteFile(@RequestParam String uuid);

    @GetMapping(value = "/files/exists/{uuid}")
    ApiResponse<Boolean> checkFileExists(@PathVariable String uuid);

    @GetMapping(value = "/files/file-url")
    ApiResponse<String> getFileUrl(@RequestParam(required = false) String uuid);
}