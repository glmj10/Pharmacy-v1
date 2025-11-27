package com.pharmacy_backend.product_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.CategoryEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.SlugUtils;
import com.pharmacy_backend.product_service.repository.CategoryRepository;
import com.pharmacy_backend.product_service.service.CategoryService;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Type;
import com.pharmacy_backend.product_service.entity.OutboxEvent;
import com.pharmacy_backend.product_service.mapper.CategoryMapper;
import com.pharmacy_backend.product_service.mapper.TypeMapper;
import com.pharmacy_backend.product_service.repository.TypeRepository;
import com.pharmacy_backend.product_service.repository.OutboxRepository;
import com.pharmacy_backend.product_service.dto.request.CategoryRequest;
import com.pharmacy_backend.product_service.dto.response.CategoryParentAndChildResponse;
import com.pharmacy_backend.product_service.dto.response.CategoryResponse;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
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
    private final ObjectMapper objectMapper;
    private final OutboxRepository outboxRepository;

    @Value("${spring.application.name}")
    private String appName;

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

        List<Category> childCategories = categoryRepository.findByParent(parentCategory);

        response.setChildren(childCategories.stream()
                .map(
                        category -> {
                            CategoryResponse childResponse = categoryMapper.toCategoryResponse(category);
                            childResponse.setType(typeMapper.toTypeResponse(category.getType()));
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

        ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(thumbnail,
                FileCategoryEnum.CATEGORY.getSubDirectory());
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

        CategoryEvent categoryEvent = CategoryEvent.builder()
                .categoryId(savedCategory.getId())
                .name(savedCategory.getName())
                .typeCode(type.getName())
                .parentId(savedCategory.getParent() != null ? savedCategory.getParent().getId() : null)
                .slug(savedCategory.getSlug())
                .build();

        Event<CategoryEvent> event = Event.<CategoryEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.CATEGORY.getName(), savedCategory.getId()))
                .eventType(EventTypeEnum.CATEGORY_CREATED.getName())
                .data(categoryEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

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

        if (thumbnail != null) {
            fileServiceClient.deleteFile(existingCategory.getThumbnail());
            ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(thumbnail,
                    FileCategoryEnum.CATEGORY.getSubDirectory());
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

        CategoryEvent categoryEvent = CategoryEvent.builder()
                .categoryId(savedCategory.getId())
                .name(savedCategory.getName())
                .typeCode(savedCategory.getType().getCode())
                .parentId(savedCategory.getParent() != null ? savedCategory.getParent().getId() : null)
                .slug(savedCategory.getSlug())
                .build();

        Event<CategoryEvent> event = Event.<CategoryEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.CATEGORY.getName(), savedCategory.getId()))
                .eventType(EventTypeEnum.CATEGORY_UPDATED.getName())
                .data(categoryEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

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

        if(category.getThumbnail() != null && !category.getThumbnail().isEmpty()) {
            fileServiceClient.deleteFile(category.getThumbnail());
        }

        categoryRepository.delete(category);

        CategoryEvent categoryEvent = CategoryEvent.builder()
                .categoryId(category.getId())
                .name(category.getName())
                .typeCode(category.getType().getCode())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .slug(category.getSlug())
                .build();

        Event<CategoryEvent> event = Event.<CategoryEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.CATEGORY.getName(), category.getId()))
                .eventType(EventTypeEnum.CATEGORY_DELETED.getName())
                .data(categoryEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

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
        List<CategoryResponse> response = categories.stream()
                .map(category -> {
                    CategoryResponse categoryResponse = categoryMapper.toCategoryResponse(category);
                    categoryResponse.setType(typeMapper.toTypeResponse(category.getType()));
                    return categoryResponse;
                })
                .toList();
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

    public void handleSaveOutboxEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.CATEGORY.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.CATEGORY_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }
}
