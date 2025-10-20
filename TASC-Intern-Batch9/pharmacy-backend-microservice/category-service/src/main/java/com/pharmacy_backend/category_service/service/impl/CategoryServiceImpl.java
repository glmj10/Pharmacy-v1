package com.pharmacy_backend.category_service.service.impl;

import com.pharmacy_backend.category_service.dto.response.CategoryParentAndChildResponse;
import com.pharmacy_backend.category_service.dto.response.CategoryResponse;
import com.pharmacy_backend.category_service.entity.Category;
import com.pharmacy_backend.category_service.mapper.CategoryMapper;
import com.pharmacy_backend.category_service.mapper.TypeMapper;
import com.pharmacy_backend.category_service.repository.CategoryRepository;
import com.pharmacy_backend.category_service.repository.TypeRepository;
import com.pharmacy_backend.category_service.service.CategoryService;
import com.pharmacy_backend.category_service.service.FileServiceClient;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final FileServiceClient fileServiceClient;
    private final TypeRepository typeRepository;
    private final TypeMapper typeMapper;

    @Transactional
    @Override
    public ApiResponse<List<CategoryResponse>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildOkResponse(response, "Lấy tất cả danh mục thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<CategoryParentAndChildResponse>> getAllCategoriesByParentSlug(String parentSlug) {
        CategoryParentAndChildResponse response = new CategoryParentAndChildResponse();
        Category parentCategory = categoryRepository.findBySlug(parentSlug)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với slug: " + parentSlug));

        response.setParent(categoryMapper.toCategoryResponse(parentCategory));
        FileMetadata parentFileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(parentCategory.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Thumbnail không tồn tại"));
        response.getParent().setThumbnail(parentFileMetadata.getUrl());

        List<Category> childCategories = categoryRepository.findByParent(parentCategory);

        response.setChildren(childCategories.stream()
                .map(
                        category -> {
                            CategoryResponse childResponse = categoryMapper.toCategoryResponse(category);
                            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(category.getThumbnail()))
                                    .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                                            HttpStatus.NOT_FOUND, "Thumbnail không tồn tại"));
                            childResponse.setType(typeMapper.toTypeResponse(category.getType()));
                            childResponse.setThumbnail(fileMetadata.getUrl());
                            childResponse.setParentId(parentCategory.getId());
                            return childResponse;
                        }
                )
                .toList());
        return ApiResponse.buildOkResponse(
                List.of(response),
                "Lấy danh mục theo slug thành công"
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));

        CategoryResponse response = categoryMapper.toCategoryResponse(category);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(category.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Thumbnail không tồn tại"));

        response.setThumbnail(fileMetadata.getUrl());
        response.setType(typeMapper.toTypeResponse(category.getType()));
        return ApiResponse.buildOkResponse(
                response,
                "Lấy danh mục theo ID thành công"
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> createCategory(CategoryRequest request, MultipartFile thumbnail) {
        Category category = categoryMapper.toCategory(request);
        category.setCreatedBy(SecurityUtils.getCurrentUserId());
        category.setSlug(createSlug(category.getName()));
        if(thumbnail == null || thumbnail.isEmpty()) {
            throw new CustomException(ErrorCode.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST, "Thumbnail không được để trống");
        }

        ApiResponse<FileMetadataResponse> thumbnailResponse = fileMetadataService.storeFile(thumbnail,
                "CATEGORY");
        category.setThumbnail(thumbnailResponse.getData().getId().toString());
        Type type = typeRepository.findByCode(request.getType())
                .orElseThrow(() -> new CustomException(ErrorCode.TYPE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy loại danh mục với code: " + request.getType()));
        category.setType(type);
        if(request.getParentId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Không tìm thấy danh mục cha với ID: " + request.getParentId()));
            category.setParent(parentCategory);
        }
        Category savedCategory = categoryRepository.save(category);

        CategoryResponse response = categoryMapper.toCategoryResponse(savedCategory);
        return ApiResponse.buildCreatedResponse(
                response,
                "Tạo danh mục thành công"
        );
    }

    @Transactional
    @Override
    public ApiResponse<CategoryResponse> updateCategory(Long id, CategoryRequest request, MultipartFile thumbnail) {
        Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));

        Category updatedCategory = categoryMapper.toCategoryUpdateFromRequest(request, existingCategory);
        updatedCategory.setSlug(createSlug(updatedCategory.getName()));
        updatedCategory.setModifiedBy(SecurityUtils.getCurrentUserId());

        if (thumbnail != null && !thumbnail.isEmpty()) {
            fileMetadataService.deleteFile(existingCategory.getThumbnail());
            ApiResponse<FileMetadataResponse> thumbnailResponse = fileMetadataService.storeFile(thumbnail, "CATEGORY");
            updatedCategory.setThumbnail(thumbnailResponse.getData().getId().toString());
        }

        if(request.getParentId() != null) {
            Category parentCategory = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Không tìm thấy danh mục cha với ID: " + request.getParentId()));
            updatedCategory.setParent(parentCategory);
        } else {
            updatedCategory.setParent(null);
        }

        Category savedCategory = categoryRepository.save(updatedCategory);

        CategoryResponse response = categoryMapper.toCategoryResponse(savedCategory);
        return ApiResponse.buildOkResponse(
                response,
                "Cập nhật danh mục thành công"
        );
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + id));

        List<Category> childCategories = categoryRepository.findByParent(category);
        if (!childCategories.isEmpty()) {
            throw new CustomException(ErrorCode.BAD_REQUEST,
                    HttpStatus.BAD_REQUEST, "Không thể xóa danh mục có danh mục con");
        }

        fileMetadataService.deleteFile(category.getThumbnail());
        categoryRepository.delete(category);

        return ApiResponse.buildOkResponse(
                null,
                "Xóa danh mục thành công"
        );
    }

    @Override
    public ApiResponse<List<CategoryResponse>> getAllProductCategories() {
        Type type = typeRepository.findByCode(CategoryTypeEnum.PRODUCT.toString())
                .orElseThrow(() -> new CustomException(ErrorCode.TYPE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy loại danh mục PRODUCT"));
        List<Category> categories = categoryRepository.findByType(type);
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildOkResponse(
                response,
                "Lấy danh mục sản phẩm thành công"
        );
    }


    @Override
    public ApiResponse<List<CategoryResponse>> getAllBlogCategories() {
        Type type = typeRepository.findByCode(CategoryTypeEnum.BLOG.toString())
                .orElseThrow(() -> new CustomException(ErrorCode.TYPE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy loại danh mục BLOG"));
        List<Category> categories = categoryRepository.findByType(type);
        List<CategoryResponse> response = buildTree(categories);
        return ApiResponse.buildOkResponse(
                response,
                "Lấy danh mục bài viết thành công"
        );
    }

    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }

    List<CategoryResponse> buildTree(List<Category> allCategories) {
        Map<Long, CategoryResponse> idToCategoryMap = new HashMap<>();
        List<CategoryResponse> roots = new ArrayList<>();

        for (Category category : allCategories) {
            CategoryResponse categoryResponse = categoryMapper.toCategoryResponse(category);
            categoryResponse.setChildren(new ArrayList<>());
            String thumbnailUrl = fileServiceClient.getFileUrl()
            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(category.getThumbnail()))
                            .orElse(null);
            categoryResponse.setThumbnail(fileMetadata != null ? fileMetadata.getUrl() : null);

            categoryResponse.setType(typeMapper.toTypeResponse(category.getType()));
            idToCategoryMap.put(category.getId(), categoryResponse);
        }

        for (Category category : allCategories) {
            CategoryResponse categoryResponse = idToCategoryMap.get(category.getId());
            if (category.getParent() != null) {
                CategoryResponse parentResponse = idToCategoryMap.get(category.getParent().getId());
                if (parentResponse != null) {
                    parentResponse.getChildren().add(categoryResponse);
                    categoryResponse.setParentId(parentResponse.getId());
                }
            } else {
                roots.add(categoryResponse);
            }
        }

        return roots;
    }
}
