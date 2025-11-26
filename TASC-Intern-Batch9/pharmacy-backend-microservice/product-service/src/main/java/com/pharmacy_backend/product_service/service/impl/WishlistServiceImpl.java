package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
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
    private final ProductRedisService productRedisService;
//    private final CartRepository cartRepository;

    @Transactional
    @Override
    public ApiResponse<List<ProductResponse>> getMyWishlist() {

        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
        List<Wishlist> wishlist = wishlistRepository.findAllByUser(user);
        List<ProductResponse> productResponses = wishlist.stream().map(
                w -> {
                    Product product = w.getProduct();
                    return productRedisService.getCachedProductDetail(product.getSlug());
                }
        ).toList();

        return ApiResponse.buildOkResponse(productResponses, "Lấy danh sách yêu thích thành công");
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
        return ApiResponse.buildCreatedResponse(null,
                "Thêm sản phẩm vào danh sách yêu thích thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> removeProductFromWishlist(Long productId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

        Wishlist wishlist = wishlistRepository.findByUserAndProduct(user, product)
                .orElseThrow(() -> new CustomException(ErrorCode.WISHLIST_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm không có trong danh sách yêu thích"));

        if(product.getNumberOfLikes() > 0) {
            product.setNumberOfLikes(product.getNumberOfLikes() - 1);
        }

        productRepository.updateProduct(productId, product);
        wishlistRepository.delete(wishlist);
        return ApiResponse.buildOkResponse(null,
                "Xóa sản phẩm khỏi danh sách yêu thích thành công");
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

        productRepository.updateAll(wishlists.stream().map(Wishlist::getProduct
        ).peek(product -> {
            if(product.getNumberOfLikes() > 0) {
                product.setNumberOfLikes(product.getNumberOfLikes() - 1);
            }
        }).toList());

        wishlistRepository.deleteAll(wishlists);

        return ApiResponse.buildOkResponse(null,
                "Xóa tất cả sản phẩm khỏi danh sách yêu thích thành công");
    }

    @Override
    public ApiResponse<Void> addAllToCart() {
//        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
//                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
//                        HttpStatus.NOT_FOUND, "Người dùng không tồn tại"));
//        List<Wishlist> wishlists = wishlistRepository.findAllByUser(user);
//        List<Product> wishListProducts = wishlists.stream().map(Wishlist::getProduct).toList();
//        if (wishListProducts.isEmpty()) {
//            return ApiResponse.buildOkResponse(
//                    null,
//                    "Danh sách yêu thích trống"
//            );
//        }
//
//        Cart cart = cartRepository.findByUser(user)
//                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
//                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        return null;
    }
}
