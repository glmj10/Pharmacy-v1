package com.pharmacy_backend.file_service.controller;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.file_service.service.FileMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/files")
public class FileController {
    private final FileMetadataService fileMetadataService;

    @PostMapping("/upload/{category}")
    public ResponseEntity<ApiResponse<FileMetadataResponse>> uploadFile(@PathVariable String category,
                                                                        @RequestPart("file") MultipartFile file) {
        ApiResponse<FileMetadataResponse> response = fileMetadataService.storeFile(file, category);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/upload-multiple/{category}")
    public ResponseEntity<ApiResponse<List<FileMetadataResponse>>> uploadMultipleFiles(@PathVariable String category,
                                                                                       @RequestPart(value = "files")List<MultipartFile> files) {
        ApiResponse<List<FileMetadataResponse>> fileMetadataResponses = fileMetadataService.storeFile(files, category);
        return ResponseEntity.ok(fileMetadataResponses);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteFile(@RequestParam(required = false) String uuid) {
        fileMetadataService.deleteFile(uuid);
        return ResponseEntity.ok(null);
    }

    @GetMapping("/exists/{uuid}")
    public ResponseEntity<ApiResponse<Boolean>> checkFileExists(@PathVariable String uuid) {
        ApiResponse<Boolean> response = fileMetadataService.checkFileExists(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/file-url")
    public ResponseEntity<ApiResponse<String>> getFileUrl(@RequestParam(required = false) String uuid) {
        ApiResponse<String> response = fileMetadataService.getFileUrl(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
//    @GetMapping("/download/{uuid}")
//    public ResponseEntity<FileSystemResource> downloadFile(@PathVariable String uuid) {
//        FileSystemResource resource = fileMetadataService.downloadFile(uuid);
//        return ResponseEntity.ok()
//                .contentType(MediaType.valueOf("image/jpeg"))
//                .body(resource);
//    }

//    @GetMapping("/load/{uuid}")
//    public ResponseEntity<FileSystemResource> loadFile(@PathVariable String uuid) {
//        FileSystemResource resource = fileMetadataService.loadFile(uuid);
//        return ResponseEntity.ok().
//                contentType(MediaType.APPLICATION_OCTET_STREAM)
//                .body(resource);
//    }
}
