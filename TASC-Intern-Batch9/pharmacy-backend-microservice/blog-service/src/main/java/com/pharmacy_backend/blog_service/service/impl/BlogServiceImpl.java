package com.pharmacy_backend.blog_service.service.impl;

import com.pharmacy_backend.blog_service.config.AppConfig;
import com.pharmacy_backend.blog_service.dto.request.BlogRequest;
import com.pharmacy_backend.blog_service.dto.response.BlogResponse;
import com.pharmacy_backend.blog_service.entity.Blog;
import com.pharmacy_backend.blog_service.entity.Category;
import com.pharmacy_backend.blog_service.mapper.BlogMapper;
import com.pharmacy_backend.blog_service.mapper.CategoryMapper;
import com.pharmacy_backend.blog_service.repository.BlogRepository;
import com.pharmacy_backend.blog_service.repository.CategoryRepository;
import com.pharmacy_backend.blog_service.service.BlogService;
import com.pharmacy_backend.blog_service.service.FileServiceClient;
import com.pharmacy_backend.blog_service.specification.BlogSpecification;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.SlugUtils;
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

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
    private final BlogRepository blogRepository;
    private final BlogMapper blogMapper;
    private final CategoryRepository categoryRepository;
    private final FileServiceClient fileServiceClient;
    private final CategoryMapper categoryMapper;

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
                    String thumbnailUrl = blog.getThumbnail();
                    response.setThumbnail(AppConfig.getImagePrefix() + thumbnailUrl);
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
        blogResponse.setThumbnail(AppConfig.getImagePrefix() + blog.getThumbnail());
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
        blogResponse.setThumbnail(AppConfig.getImagePrefix() + blog.getThumbnail());
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

        ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(thumbnail,
                FileCategoryEnum.BLOG.getSubDirectory());
        blog.setThumbnail(thumbnailResponse.getData().getPath());
        blog.setThumbnailUUID(thumbnailResponse.getData().getId().toString());
        blog.setCategory(category);
        Blog savedBlog = blogRepository.save(blog);

        BlogResponse blogResponse = blogMapper.toBlogResponse(savedBlog);
        blogResponse.setThumbnail(AppConfig.getImagePrefix() +  blogResponse.getThumbnail());
        return ApiResponse.buildCreatedResponse(blogResponse, "Tạo bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<BlogResponse> updateBlog(Long id, BlogRequest request, MultipartFile thumbnail) {
        Blog existingBlog = blogRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với ID: " + id));

        Blog blogUpdateFromRequest = blogMapper.toBlogUpdateFromRequest(request, existingBlog);

        if (thumbnail != null) {
            fileServiceClient.deleteFile(existingBlog.getThumbnailUUID());
            ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(thumbnail,
                    FileCategoryEnum.CATEGORY.getSubDirectory());
            blogUpdateFromRequest.setThumbnail(thumbnailResponse.getData().getPath());
            blogUpdateFromRequest.setThumbnailUUID(thumbnailResponse.getData().getId().toString());
        }

        blogUpdateFromRequest.setSlug(createSlug(blogUpdateFromRequest.getTitle()));
        blogUpdateFromRequest.setModifiedBy(SecurityUtils.getCurrentUserId());
        Blog updatedBlog = blogRepository.save(blogUpdateFromRequest);
        BlogResponse blogResponse = blogMapper.toBlogResponse(updatedBlog);
        blogResponse.setThumbnail(AppConfig.getImagePrefix() + updatedBlog.getThumbnail());

        return ApiResponse.buildOkResponse(blogResponse, "Cập nhật bài viết thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> deleteBlog(Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.BLOG_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy bài viết với ID: " + id));
        fileServiceClient.deleteFile(blog.getThumbnailUUID());
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
