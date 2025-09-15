package com.project.pharmacy.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.FileMetadataResponse;
import com.project.pharmacy.entity.FileMetadata;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.enums.FileCategoryEnum;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.FileMetadataRepository;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.service.FileMetadataService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

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

            return ApiResponse.<FileMetadataResponse>builder()
                    .status(HttpStatus.CREATED.value())
                    .message("Upload file thành công")
                    .data(response)
                    .timestamp(LocalDateTime.now())
                    .build();

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

