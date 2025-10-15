package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.request.ProductCMSFilterRequest;
import com.project.pharmacy.dto.request.ProductFilterCustomerRequest;
import com.project.pharmacy.dto.request.ProductRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.PageResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.dto.response.ProductImageResponse;
import com.project.pharmacy.entity.*;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.BrandMapper;
import com.project.pharmacy.mapper.CategoryMapper;
import com.project.pharmacy.mapper.ProductMapper;
import com.project.pharmacy.repository.*;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.FileMetadataService;
import com.project.pharmacy.service.ProductImageService;
import com.project.pharmacy.service.ProductService;

import com.project.pharmacy.utils.SlugUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductServiceImpl implements ProductService {
    final ProductRepository productRepository;
    final ProductMapper productMapper;
    final FileMetadataService fileMetadataService;
    final ProductImageService productImageService;
    final BrandRepository brandRepository;
    final BrandMapper brandMapper;
    final CategoryRepository categoryRepository;
    final WishlistRepository wishlistRepository;
    final UserRepository userRepository;
    final CategoryMapper categoryMapper;
    final FileMetadataRepository fileMetadataRepository;
    final ProductRedisService productRedisService;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex, int pageSize, ProductCMSFilterRequest filterRequest) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }

        List<Product> products = productRepository.findAll(pageSize, (pageIndex - 1) * pageSize, filterRequest);


        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    response.setBrand(brandMapper.toBrandResponse(product.getBrand()));
                    response.setImportPrice(product.getImportPrice());
                    response.setCategories(
                            product.getCategories().stream()
                                    .map(categoryMapper::toCategoryResponse)
                                    .collect(Collectors.toList())
                    );
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
                    response.setThumbnailUrl(
                            fileMetadata.getUrl()
                    );

                    return response;
                })
                .toList();
        long totalElements = productRepository.countProducts(filterRequest);
        int totalPage = (int) Math.ceil((double) totalElements / pageSize);
        boolean hasNext = pageIndex < totalPage;
        boolean hasPrevious = pageIndex > 1;

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(totalPage)
                .totalElements(totalElements)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllActiveProduct(int pageIndex,
                                                                                int pageSize,
                                                                                ProductFilterCustomerRequest filterRequest)
    {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }

        List<Product> products = productRepository.findAll(pageSize, (pageIndex - 1) * pageSize, filterRequest);
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                            HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
                    response.setThumbnailUrl(
                            fileMetadata.getUrl()
                    );

                    return response;
                })
                .toList();
        long totalElements = productRepository.countProducts(filterRequest);
        int totalPage = (int) Math.ceil((double) totalElements / pageSize);
        boolean hasNext = pageIndex < totalPage;
        boolean hasPrevious = pageIndex > 1;

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .content(productResponses)
                .currentPage(pageIndex)
                .totalPages(totalPage)
                .totalElements(totalElements)
                .hasNext(hasNext)
                .hasPrevious(hasPrevious)
                .build();
        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));
        ProductResponse productResponse = productMapper.toProductResponse(product);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
        productResponse.setThumbnailUrl(fileMetadata.getUrl());
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        productResponse.setImportPrice(product.getImportPrice());
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream().map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));
        return ApiResponse.buildOkResponse(productResponse, "Lấy thông tin sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với slug: " + slug));
        ProductResponse productResponse = productRedisService.getCachedProductDetail(slug);
        if(productResponse != null) {
            User user;
            Long userId = SecurityUtils.getCurrentUserId();
            if(userId != null) {
                user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                        .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                                HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
                Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                productResponse.setInWishlist(isInWishList);
            } else {
                productResponse.setInWishlist(false);
            }
            return ApiResponse.buildOkResponse(productResponse, "Lấy thông tin sản phẩm thành công");
        } else {
            productResponse = productMapper.toProductResponse(product);
            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                    .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                            HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
            productResponse.setThumbnailUrl(fileMetadata.getUrl());
            productResponse.setImages(productImageService.getProductImagesByProduct(product));
            productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
            List<Category> categories = categoryRepository.findAllByProductsContains(product);
            productResponse.setCategories(categories.stream()
                    .map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));
            User user;
            Long userId = SecurityUtils.getCurrentUserId();
            if(userId != null) {
                user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                        .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                                HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
                Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                productResponse.setInWishlist(isInWishList);
            } else {
                productResponse.setInWishlist(false);
            }
        }

        return ApiResponse.buildOkResponse(productResponse, "Lấy thông tin sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> createProduct(ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        if(thumbnail == null || thumbnail.isEmpty()) {
            throw new CustomException(ErrorCode.THUMBNAIL_REQUIRED,
                    HttpStatus.BAD_REQUEST, "Hình ảnh đại diện sản phẩm không được để trống");
        }
        if(images == null) {
            images = new ArrayList<>();
        }
        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, HttpStatus.NOT_FOUND,
                                        "Không tìm thấy thương hiệu với ID: " + request.getBrandId()));

        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());

        if (categories.isEmpty()) {
            throw new CustomException(ErrorCode.CATEGORY_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Không tìm thấy danh mục với các ID đã chọn");
        }

        Product product = productMapper.toProduct(request);
        product.setSlug(createSlug(product.getTitle()));
        product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());
        product.setBrand(brand);
        product.setCategories(categories);
        product.setCreatedBy(SecurityUtils.getCurrentUserId());
        product.setModifiedBy(SecurityUtils.getCurrentUserId());

        product = productRepository.createProduct(product);
        images.add(0, thumbnail);
        List<ProductImageResponse> productImages = productImageService.createProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.buildCreatedResponse(productResponse, "Thêm sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));

        if(thumbnail != null && !thumbnail.isEmpty()) {
            product.setThumbnail(fileMetadataService.storeFile(thumbnail, "PRODUCT").getData().getId().toString());
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Không tìm thấy thương hiệu với ID: " + request.getBrandId()));
        Product updatedProduct = productMapper.toProductUpdateFromRequest(request, product);;
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        updatedProduct.setBrand(brand);
        updatedProduct.setCategories(categories);
        product.setModifiedBy(SecurityUtils.getCurrentUserId());
        product = productRepository.updateProduct(id, updatedProduct);
        List<ProductImageResponse> productImages = productImageService.updateProductImages(product, images);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);

        return ApiResponse.buildOkResponse(productResponse, "Cập nhật sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> changeProductStatus(Long id, Boolean active) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));
        product.setActive(active);
        product.setModifiedBy(SecurityUtils.getCurrentUserId());
        product = productRepository.updateProduct(id, product);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImageService.getProductImagesByProduct(product));

        return ApiResponse.buildOkResponse(productResponse, "Cập nhật trạng thái sản phẩm thành công");
    }

    @Override
    public ApiResponse<Void> deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));
        productImageService.deleteProductImagesByProduct(product);
        productRepository.deleteProduct(id);

        return ApiResponse.buildOkResponse(null, "Xoá sản phẩm thành công");
    }

    @Override
    public ApiResponse<Long> getTotalProduct() {
        long totalProducts = productRepository.countProducts();
        return ApiResponse.buildOkResponse(totalProducts, "Lấy tổng số sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> getTop15ProductsByNumberOfLikes() {
        List<Product> products = productRepository.findTop15ByActiveTrue();
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                            HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }

                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
                    response.setThumbnailUrl(fileMetadata.getUrl());
                    return response;
                })
                .toList();

        return ApiResponse.buildOkResponse(productResponses, "Lấy 15 sản phẩm được yêu thích nhất thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> get15ProductByBrand(Long brandId) {
        Brand brand = brandRepository.findById(brandId)
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy thương hiệu với ID: " + brandId));
        List<Product> products = productRepository.findTop15ByBrandAndActive(brand, true);
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                            HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        } else {
            user = null;
        }

        List<ProductResponse> productResponses = products
                .stream()
                .map(product -> {
                    ProductResponse response = productMapper.toProductResponse(product);
                    if(user != null) {
                        Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                        response.setInWishlist(isInWishList);
                    } else {
                        response.setInWishlist(false);
                    }
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
                    response.setThumbnailUrl(fileMetadata.getUrl());

                    return response;
                })
                .toList();

        return ApiResponse.buildOkResponse(productResponses, "Lấy 15 sản phẩm cùng thương hiệu thành công");
    }


    private String createSlug(String name) {
        String baseSlug = SlugUtils.generateSlug(name);
        int cnt = 1;
        String slug = baseSlug;
        while(productRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + cnt++;
        }
        return slug;
    }

    private ProductResponse buildProductResponse(Product product) {
        ProductResponse productResponse = productMapper.toProductResponse(product);
        FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                .orElseThrow(() -> new CustomException(ErrorCode.IMAGE_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy hình ảnh đại diện cho sản phẩm"));
        productResponse.setThumbnailUrl(fileMetadata.getUrl());
        productResponse.setImages(productImageService.getProductImagesByProduct(product));
        productResponse.setBrand(brandMapper.toBrandResponse(product.getBrand()));
        List<Category> categories = categoryRepository.findAllByProductsContains(product);
        productResponse.setCategories(categories.stream().map(categoryMapper::toCategoryResponse).collect(Collectors.toList()));
        User user;
        Long userId = SecurityUtils.getCurrentUserId();
        if(userId != null) {
            user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                            HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
            Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
            productResponse.setInWishlist(isInWishList);
        } else {
            productResponse.setInWishlist(false);
        }

        return productResponse;
    }

}