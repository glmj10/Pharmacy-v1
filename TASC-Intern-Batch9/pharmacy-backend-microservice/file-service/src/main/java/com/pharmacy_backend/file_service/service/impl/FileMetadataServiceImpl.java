package com.pharmacy_backend.file_service.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.file_service.entity.FileMetadata;
import com.pharmacy_backend.file_service.repository.FileMetadataRepository;
import com.pharmacy_backend.file_service.service.FileMetadataService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RequiredArgsConstructor
@Service
@Slf4j
public class FileMetadataServiceImpl implements FileMetadataService {

    private final FileMetadataRepository fileMetadataRepository;
    private final Cloudinary cloudinary;

    @Transactional
    @Override
    public ApiResponse<FileMetadataResponse> storeFile(MultipartFile file, String category) {
        FileCategoryEnum fileCategoryEnum = FileCategoryEnum.valueOf(category.toUpperCase());
        String originalFileName = file.getOriginalFilename();
        String extension = Optional.ofNullable(originalFileName)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(originalFileName.lastIndexOf('.') + 1))
                .orElse("Unknown");

        String publicId = UUID.randomUUID().toString();

        try {
            Map<String, Object> options = ObjectUtils.asMap(
                    "folder", fileCategoryEnum.getSubDirectory(),
                    "public_id", publicId,
                    "overwrite", true,
                    "resource_type", "auto"
            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String url = (String) uploadResult.get("secure_url");

            FileMetadata fileMetadata = FileMetadata.builder()
                    .originalFileName(originalFileName)
                    .storedFileName(publicId)
                    .fileExtension(extension)
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .fileType(fileCategoryEnum.getSubDirectory())
                    .url(url)
                    .build();

            fileMetadata = fileMetadataRepository.save(fileMetadata);

            FileMetadataResponse response = FileMetadataResponse.builder()
                    .id(fileMetadata.getUuid())
                    .storedFileName(publicId)
                    .fileUrl(url)
                    .build();

            return ApiResponse.buildCreatedResponse(response, "Upload file thành công");

        } catch (IOException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể lưu file" + e.getMessage());
        }
    }

    @Override
    public FileSystemResource downloadFile(String uuidStr) {
        throw new UnsupportedOperationException("Download vật lý không hỗ trợ trong Cloudinary. Sử dụng URL.");
    }

    @Override
    public FileSystemResource loadFile(String uuidStr) {
        throw new UnsupportedOperationException("Không hỗ trợ đọc file vật lý từ Cloudinary.");
    }

    @Override
    @Transactional
    public ApiResponse<List<FileMetadataResponse>> storeFile(List<MultipartFile> multipartFiles, String category) {
        List<FileMetadataResponse> fileMetadataResponseList  = new ArrayList<>();
        for (MultipartFile file : multipartFiles) {
            fileMetadataResponseList.add(storeFile(file, category).getData());
        }
        return ApiResponse.buildCreatedResponse(fileMetadataResponseList, "Upload file thành công");
    }

    @Override
    public ApiResponse<Boolean> checkFileExists(String uuidStr) {
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "File không tồn tại"));

        return ApiResponse.buildOkResponse(true, "File tồn tại");
    }

    @Override
    public ApiResponse<String> getFileUrl(String uuidStr) {
        if(uuidStr.isEmpty()) {
            return ApiResponse.buildOkResponse(null, "UUID không được cung cấp");
        }
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElse(null);
        if (fileMetadata == null) {
            return ApiResponse.buildOkResponse(null, "File không tồn tại");
        }
        return ApiResponse.buildOkResponse(fileMetadata.getUrl(), "Lấy URL file thành công");
    }

    @Transactional
    @Override
    public void deleteFile(String uuidStr) {
        if (uuidStr == null || uuidStr.isEmpty()) return;

        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(uuidStr))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "File không tồn tại"));

        String publicIdWithFolder = fileMetadata.getFileType() + "/" + fileMetadata.getStoredFileName();

        try {
            Map<String, Object> result = cloudinary.uploader().destroy(publicIdWithFolder, ObjectUtils.asMap(
                    "resource_type", "image"
            ));

            String destroyResult = (String) result.get("result");

            if (!"ok".equals(destroyResult) && !"not found".equals(destroyResult)) {
                throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                        "Không thể xóa file từ Cloudinary: " + destroyResult);
            }

            fileMetadataRepository.delete(fileMetadata);
        } catch (IOException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    "Không thể xóa file: " + e.getMessage());
        }
    }
}

