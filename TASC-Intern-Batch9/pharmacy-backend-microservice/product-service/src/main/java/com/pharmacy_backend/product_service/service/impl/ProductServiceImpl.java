package com.pharmacy_backend.product_service.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.ProductEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.SlugUtils;
import com.pharmacy_backend.product_service.dto.request.ProductCMSFilterRequest;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.product_service.dto.request.ProductFilterCustomerRequest;
import com.pharmacy_backend.product_service.dto.request.ProductRequest;
import com.pharmacy_backend.product_service.dto.response.ProductImageResponse;
import com.pharmacy_backend.product_service.entity.*;
import com.pharmacy_backend.product_service.mapper.BrandMapper;
import com.pharmacy_backend.product_service.mapper.CategoryMapper;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.repository.*;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.service.ProductImageService;
import com.pharmacy_backend.product_service.service.ProductService;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductServiceImpl implements ProductService {
    final ProductRepository productRepository;
    final ProductMapper productMapper;
    final ProductImageService productImageService;
    final BrandRepository brandRepository;
    final BrandMapper brandMapper;
    final CategoryRepository categoryRepository;
    final WishlistRepository wishlistRepository;
    final UserRepository userRepository;
    final CategoryMapper categoryMapper;
    final FileServiceClient fileServiceClient;
    final ProductRedisService productRedisService;
    final ObjectMapper objectMapper;
    final OutboxRepository outboxRepository;

    @Value("${spring.application.name}")
    private String appName;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getAllCMSProduct(int pageIndex, int pageSize,
                                                                             ProductCMSFilterRequest filterRequest) {
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
                    response.setThumbnailUrl(
                            fileServiceClient.getFilelUrl(product.getThumbnail())
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
                    response.setThumbnailUrl(
                            fileServiceClient.getFilelUrl(product.getThumbnail())
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
        productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));
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
            productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));
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
        product.setThumbnail(fileServiceClient.uploadFile(thumbnail,
                FileCategoryEnum.PRODUCT.getSubDirectory()).getData().getId().toString());
        product.setBrand(brand);
        product.setCategories(categories);
        product.setCreatedBy(SecurityUtils.getCurrentUserId());
        product.setModifiedBy(SecurityUtils.getCurrentUserId());
        List<ProductImageResponse> productImages = productImageService.createProductImages(product, images);

        product = productRepository.createProduct(product);
        images.add(0, thumbnail);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);
        productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));

        ProductEvent productEvent = ProductEvent.builder()
                .productId(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .thumbnailUrl(productResponse.getThumbnailUrl())
                .priceNew(product.getPriceNew())
                .priceOld(product.getPriceOld())
                .active(product.getActive())
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PRODUCT.getName(), product.getId()))
                .eventType(EventTypeEnum.PRODUCT_CREATED.getName())
                .data(productEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

        return ApiResponse.buildCreatedResponse(productResponse, "Thêm sản phẩm thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ProductResponse> updateProduct(Long id, ProductRequest request, MultipartFile thumbnail, List<MultipartFile> images) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));

        if (thumbnail != null) {
            fileServiceClient.deleteFile(product.getThumbnail());
            ApiResponse<FileMetadataResponse> thumbnailResponse = fileServiceClient.uploadFile(thumbnail,
                    FileCategoryEnum.CATEGORY.getSubDirectory());
            product.setThumbnail(thumbnailResponse.getData().getId().toString());
        }

        Brand brand = brandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Không tìm thấy thương hiệu với ID: " + request.getBrandId()));
        Product updatedProduct = productMapper.toProductUpdateFromRequest(request, product);
        List<Category> categories = categoryRepository.findAllById(request.getCategoryIds());
        updatedProduct.setBrand(brand);
        updatedProduct.setCategories(categories);
        product.setModifiedBy(SecurityUtils.getCurrentUserId());

        List<ProductImageResponse> productImages = productImageService.updateProductImages(product, images);

        product = productRepository.updateProduct(id, updatedProduct);

        ProductResponse productResponse = productMapper.toProductResponse(product);
        productResponse.setImages(productImages);
        productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));

        ProductEvent productEvent = ProductEvent.builder()
                .productId(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .thumbnailUrl(productResponse.getThumbnailUrl())
                .priceNew(product.getPriceNew())
                .priceOld(product.getPriceOld())
                .active(product.getActive())
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PRODUCT.getName(), product.getId()))
                .eventType(EventTypeEnum.PRODUCT_CREATED.getName())
                .data(productEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);
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
        productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));

        ProductEvent productEvent = ProductEvent.builder()
                .productId(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .thumbnailUrl(productResponse.getThumbnailUrl())
                .priceNew(product.getPriceNew())
                .priceOld(product.getPriceOld())
                .active(product.getActive())
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PRODUCT.getName(), product.getId()))
                .eventType(EventTypeEnum.PRODUCT_CREATED.getName())
                .data(productEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

        return ApiResponse.buildOkResponse(productResponse, "Cập nhật trạng thái sản phẩm thành công");
    }

    @Override
    public ApiResponse<Void> deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy sản phẩm với ID: " + id));
        fileServiceClient.deleteFile(product.getThumbnail());
        productImageService.deleteProductImagesByProduct(product);
        productRepository.deleteProduct(id);

        ProductEvent productEvent = ProductEvent.builder()
                .productId(product.getId())
                .title(product.getTitle())
                .slug(product.getSlug())
                .thumbnailUrl(fileServiceClient.getFileUrl(product.getThumbnail()).getData())
                .priceNew(product.getPriceNew())
                .priceOld(product.getPriceOld())
                .active(product.getActive())
                .build();

        Event<ProductEvent> event = Event.<ProductEvent>builder()
                .key(String.format("%s-%d", PartitionKeyEnum.PRODUCT.getName(), product.getId()))
                .eventType(EventTypeEnum.PRODUCT_CREATED.getName())
                .data(productEvent)
                .source(appName)
                .build();

        handleSaveOutboxEvent(event);

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
                    response.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));
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
                    response.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));

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
        productResponse.setThumbnailUrl(fileServiceClient.getFilelUrl(product.getThumbnail()));
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

    public void handleSaveOutboxEvent(Event<?> event) {
        OutboxEvent outboxEvent = new OutboxEvent();
        outboxEvent.setAggregateType(PartitionKeyEnum.PRODUCT.getName());
        outboxEvent.setAggregateId(event.getKey());
        outboxEvent.setEventType(event.getEventType());
        outboxEvent.setTopic(TopicEnum.PRODUCT_TOPIC.getName());
        try {
            outboxEvent.setPayload(objectMapper.writeValueAsString(event));
            outboxRepository.save(outboxEvent);
        } catch (JsonProcessingException e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }
    }

}