
// src/main/java/com/pharmacy_backend/file_service/service/impl/FileMinioPublicService.java
package com.pharmacy_backend.file_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.file_service.entity.FileMetadata;
import com.pharmacy_backend.file_service.repository.FileMetadataRepository;
import com.pharmacy_backend.file_service.service.FileMetadataService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.*;

@RequiredArgsConstructor
@Service
@Slf4j
@Primary
public class FileMinioService implements FileMetadataService {

    private final FileMetadataRepository fileMetadataRepository;
    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.endpoint}")
    private String endpoint;
    @Value("${minio.public-base-url:}")
    private String publicBaseUrl;

    @Transactional(rollbackFor = Exception.class)
    @Override
    public ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category) {
        FileCategoryEnum fileCategoryEnum = FileCategoryEnum.valueOf(category.toUpperCase());

        String originalFileName = file.getOriginalFilename();
        String extension = Optional.ofNullable(originalFileName)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(originalFileName.lastIndexOf('.') + 1))
                .orElse("Unknown");

        String publicId = UUID.randomUUID().toString();
        String objectKey = fileCategoryEnum.getSubDirectory() + "/" + publicId;

        try (InputStream is = file.getInputStream()) {
            // Upload
            PutObjectArgs putArgs = PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .contentType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"))
                    .stream(is, file.getSize(), -1)
                    .build();
            minioClient.putObject(putArgs);

            String publicUrl = buildPublicUrl(bucket, objectKey);
            String path = buildPath(bucket, objectKey);
            FileMetadata fileMetadata = FileMetadata.builder()
                    .originalFileName(originalFileName)
                    .storedFileName(publicId)
                    .fileExtension(extension)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .fileType(fileCategoryEnum.getSubDirectory())
                    .url(publicUrl)
                    .path(path)
                    .build();

            fileMetadata = fileMetadataRepository.save(fileMetadata);

            FileMetadataResponse response = FileMetadataResponse.builder()
                    .id(fileMetadata.getUuid())
                    .storedFileName(publicId)
                    .path(path)
                    .build();

            return ApiResponse.buildCreatedResponse(response, "Upload file thành công");

        } catch (Exception e) {
            log.error("MinIO upload error: ", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể lưu file: " + e.getMessage());
        }
    }

    @Override
    public FileSystemResource downloadFile(String uuidStr) {
        if (uuidStr == null || uuidStr.isEmpty()) {
            throw new CustomException(ErrorCode.BAD_REQUEST, "UUID không hợp lệ");
        }
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "File không tồn tại"));

        String objectKey = fileMetadata.getFileType() + "/" + fileMetadata.getStoredFileName();

        try (InputStream is = minioClient.getObject(GetObjectArgs.builder()
                .bucket(bucket)
                .object(objectKey)
                .build())) {

            File temp = File.createTempFile("minio_", "_" + fileMetadata.getStoredFileName());
            try (FileOutputStream fos = new FileOutputStream(temp)) {
                is.transferTo(fos);
            }
            return new FileSystemResource(temp);

        } catch (Exception e) {
            log.error("MinIO download error: ", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể tải file: " + e.getMessage());
        }
    }

    @Override
    public FileSystemResource loadFile(String uuidStr) {
        return downloadFile(uuidStr);
    }

    @Transactional
    @Override
    public ApiResponse<List<FileMetadataResponse>> storeFile(List<MultipartFile> multipartFiles, String category) {
        List<FileMetadataResponse> list = new ArrayList<>();
        for (MultipartFile file : multipartFiles) {
            list.add(storeFile(file, category).getData());
        }
        return ApiResponse.buildCreatedResponse(list, "Upload file thành công");
    }

    @Override
    public ApiResponse<Boolean> checkFileExists(String uuidStr) {
        fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "File không tồn tại"));

        return ApiResponse.buildOkResponse(true, "File tồn tại");
    }

    @Override
    public ApiResponse<String> getFileUrl(String uuidStr) {
        if (uuidStr == null || uuidStr.isEmpty()) {
            return ApiResponse.buildOkResponse(null, "UUID không được cung cấp");
        }
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElse(null);
        if (fileMetadata == null) {
            return ApiResponse.buildOkResponse(null, "File không tồn tại");
        }

        String objectKey = fileMetadata.getFileType() + "/" + fileMetadata.getStoredFileName();
        String url = Optional.ofNullable(fileMetadata.getUrl())
                .filter(u -> !u.isBlank())
                .orElse(buildPublicUrl(bucket, objectKey));

        return ApiResponse.buildOkResponse(url, "Lấy URL file thành công");
    }

    @Transactional
    @Override
    public void deleteFile(String uuidStr) {
        if (uuidStr == null || uuidStr.isEmpty()) return;

        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElse(null);

        if(fileMetadata == null) {
            return;
        }

        String objectKey = fileMetadata.getFileType() + "/" + fileMetadata.getStoredFileName();

        try {
            minioClient.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(objectKey)
                    .build());
            fileMetadataRepository.delete(fileMetadata);
        } catch (Exception e) {
            log.error("MinIO remove error: ", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Không thể xóa file: " + e.getMessage());
        }
    }

    private String buildPublicUrl(String bucket, String objectKey) {
        String base = (publicBaseUrl != null && !publicBaseUrl.isBlank()) ? publicBaseUrl : endpoint;
        if (base.endsWith("/")) base = base.substring(0, base.length() - 1);
        return base + "/" + bucket + "/" + objectKey;
    }

    private String buildPath(String bucket, String objectKey) {
        return "/" + bucket + "/" + objectKey;
    }
}