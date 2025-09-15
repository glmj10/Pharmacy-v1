package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.request.BlogRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.BlogResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.entity.Blog;
import com.project.pharmacy.entity.Category;
import com.project.pharmacy.entity.FileMetadata;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.BlogMapper;
import com.project.pharmacy.mapper.CategoryMapper;
import com.project.pharmacy.repository.BlogRepository;
import com.project.pharmacy.repository.CategoryRepository;
import com.project.pharmacy.repository.FileMetadataRepository;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.BlogService;
import com.project.pharmacy.service.FileMetadataService;
import com.project.pharmacy.specification.BlogSpecification;
import com.project.pharmacy.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private final BlogRepository blogRepository;
    private final BlogMapper blogMapper;
    private final FileMetadataService fileMetadataService;
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final FileMetadataRepository fileMetadataRepository;

    @Override
    public ApiResponse<PageResponse<List<BlogResponse>>> getAllBlogs(int pageIndex,
                                                                     int pageSize, String title, String category) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }

        Specification<Blog> blogSpecification = BlogSpecification.hasTitle(title)
                .and(BlogSpecification.hasCategorySlug(category));

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize,
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Blog> blogPage;

        blogPage = blogRepository.findAll(blogSpecification, pageable);

        List<BlogResponse> blogResponses = blogPage.getContent().stream().map(
                blog -> {
                    BlogResponse response = blogMapper.toBlogResponse(blog);
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(blog.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                                            HttpStatus.NOT_FOUND, "Không tìm thấy ảnh bài viết"));

                    response.setThumbnail(fileMetadata.getUrl());
                    return response;
                }
        ).toList();
        PageResponse<List<BlogResponse>> pageResponse = PageResponse.<List<BlogResponse>>builder()
                .content(blogResponses)
                .currentPage(pageIndex)
                .totalPages(blogPage.getTotalPages())
                .totalElements(blogPage.getTotalElements())
                .hasNext(blogPage.hasNext())
                .hasPrevious(blogPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BlogResponse> getBlogBySlug(String slug) {
        Blog blog = blogRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với slug: " + slug));
        BlogResponse blogResponse = blogMapper.toBlogResponse(blog);
        blogResponse.setCategory(categoryMapper.toCategoryResponse(blog.getCategory()));
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(blog.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh với ID: " + blog.getThumbnail()));
        blogResponse.setThumbnail(fileMetadata.getUrl());
        return ApiResponse.buildOkResponse(blogResponse, "Lấy bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BlogResponse> getBlogById(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với ID: " + id));
        BlogResponse blogResponse = blogMapper.toBlogResponse(blog);
        blogResponse.setCategory(categoryMapper.toCategoryResponse(blog.getCategory()));
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(blog.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh với ID: " + blog.getThumbnail()));
        blogResponse.setThumbnail(fileMetadata.getUrl());
        return ApiResponse.buildOkResponse(blogResponse, "Lấy bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BlogResponse> createBlog(BlogRequest request, MultipartFile thumbnail) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với ID: " + request.getCategoryId()));

        Blog blog = blogMapper.toBlog(request);
        blog.setSlug(createSlug(blog.getTitle()));
        blog.setCreatedBy(SecurityUtils.getCurrentUserId());

        var fileMetadata = fileMetadataService.storeFile(thumbnail, "BLOG");
        blog.setThumbnail(fileMetadata.getData().getId().toString());
        blog.setCategory(category);
        Blog savedBlog = blogRepository.save(blog);

        BlogResponse blogResponse = blogMapper.toBlogResponse(savedBlog);
        return ApiResponse.buildCreatedResponse(blogResponse, "Tạo bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BlogResponse> updateBlog(Long id, BlogRequest request, MultipartFile thumbnail) {
        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với ID: " + id));

        Blog blogUpdateFromRequest = blogMapper.toBlogUpdateFromRequest(request, existingBlog);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            fileMetadataService.deleteFile(existingBlog.getThumbnail());
            var fileMetadata = fileMetadataService.storeFile(thumbnail, "BLOG");
            blogUpdateFromRequest.setThumbnail(fileMetadata.getData().getId().toString());
        } else {
            blogUpdateFromRequest.setThumbnail(existingBlog.getThumbnail());
        }

        blogUpdateFromRequest.setSlug(createSlug(blogUpdateFromRequest.getTitle()));
        blogUpdateFromRequest.setModifiedBy(SecurityUtils.getCurrentUserId());

        Blog updatedBlog = blogRepository.save(blogUpdateFromRequest);
        BlogResponse blogResponse = blogMapper.toBlogResponse(updatedBlog);

        return ApiResponse.buildOkResponse(blogResponse, "Cập nhật bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteBlog(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với ID: " + id));
        blogRepository.delete(blog);
        return ApiResponse.buildOkResponse(null, "Xóa bài viết thành công");
    }

    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(blogRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }
}
