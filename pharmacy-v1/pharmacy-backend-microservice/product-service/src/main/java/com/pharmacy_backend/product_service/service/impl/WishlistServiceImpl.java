package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.service.RedisService;
import com.pharmacy_backend.product_service.config.AppConfig;
import com.pharmacy_backend.product_service.dto.response.PageResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.User;
import com.pharmacy_backend.product_service.entity.Wishlist;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.repository.UserRepository;
import com.pharmacy_backend.product_service.repository.WishlistRepository;
import com.pharmacy_backend.product_service.service.WishlistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RedisService redisService;
    private final ProductMapper productMapper;

    @Transactional
    @Override
    public ApiResponse<PageResponse<List<ProductResponse>>> getMyWishlist(int pageIndex, int pageSize) {
        if(pageIndex < 1) {
            pageIndex = 1;
        }

        if(pageSize < 1) {
            pageSize = 10;
        }
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Wishlist> wishlistPage = wishlistRepository.findAllByUser(user, pageable);

        List<ProductResponse> productResponses = wishlistPage.getContent().stream().map(
                w -> {
                    Product product = w.getProduct();
                    ProductResponse response = productMapper.toProductResponse(product);
                    response.setThumbnail(AppConfig.getImagePrefix() + product.getThumbnail());
                    return response;
                }
        ).toList();

        PageResponse<List<ProductResponse>> pageResponse = PageResponse.<List<ProductResponse>>builder()
                .currentPage(pageIndex)
                .totalPages(wishlistPage.getTotalPages())
                .totalElements(wishlistPage.getTotalElements())
                .hasNext(wishlistPage.hasNext())
                .hasPrevious(wishlistPage.hasPrevious())
                .content(productResponses)
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách yêu thích thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> addProductToWishlist(Long productId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));
        if(product.getActive() == null || !product.getActive()) {
            throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                    HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại");
        }

        if (wishlistRepository.existsByUserAndProduct(user, product)) {
            throw new CustomException(ErrorCode.VALIDATION_ERROR,
                    HttpStatus.BAD_REQUEST, "Sản phẩm đã có trong danh sách yêu thích");
        }

        wishlist.setProduct(product);
        product.setNumberOfLikes(product.getNumberOfLikes() + 1);
        productRepository.updateProduct(productId, product);
        wishlistRepository.save(wishlist);
        redisService.addValueToSet(String.format("%s:%d",
                RedisKeyTypeEnum.WISHLIST_USER.getKey(),
                user.getId()), product.getSlug(), RedisKeyTypeEnum.WISHLIST_USER.getDuration());

        return ApiResponse.buildCreatedResponse(null,
                "Thêm sản phẩm vào danh sách yêu thích thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> removeProductsFromWishlist(List<Long> productIds) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        List<Wishlist> wishlists = wishlistRepository.findAllByUserAndProductIds(user, productIds)
                .orElseThrow(() -> new CustomException(ErrorCode.WISHLIST_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm không có trong danh sách yêu thích"));

        List<Product> products = wishlists.stream().map(wishlist -> {
            Product product = wishlist.getProduct();
                if(product.getNumberOfLikes() > 0) {
                    product.setNumberOfLikes(product.getNumberOfLikes() - 1);
                }
                product.setModifiedBy(user.getId());
                return product;
        }).toList();

        productRepository.bulkUpdateProduct(products);
        wishlistRepository.deleteAll(wishlists);
        String[] productSlugs = products.stream().map(Product::getSlug).toArray(String[]::new);
        redisService.removeSetMember(String.format("%s:%d",
                RedisKeyTypeEnum.WISHLIST_USER.getKey(),
                user.getId()), productSlugs);
        return ApiResponse.buildOkResponse(null,
                "Xóa các sản phẩm khỏi danh sách yêu thích thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> clearWishlist() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);
        if (wishlists.isEmpty()) {
            return ApiResponse.buildOkResponse(
                    null,
                    "Danh sách yêu thích đã trống"
            );
        }

        productRepository.bulkUpdateProduct(wishlists.stream().map(Wishlist::getProduct
        ).peek(product -> {
            if(product.getNumberOfLikes() > 0) {
                product.setNumberOfLikes(product.getNumberOfLikes() - 1);
            }
            product.setModifiedBy(user.getId());
        }).toList());

        wishlistRepository.deleteAll(wishlists);
        redisService.removeAllSetMembers(String.format("%s:%d",
                RedisKeyTypeEnum.WISHLIST_USER.getKey(),
                user.getId()));

        return ApiResponse.buildOkResponse(null,
                "Xóa tất cả sản phẩm khỏi danh sách yêu thích thành công");
    }
}
