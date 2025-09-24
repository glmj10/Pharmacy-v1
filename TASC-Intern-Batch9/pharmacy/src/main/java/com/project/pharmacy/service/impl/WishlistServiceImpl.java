package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.entity.FileMetadata;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.entity.Wishlist;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.ProductMapper;
import com.project.pharmacy.repository.FileMetadataRepository;
import com.project.pharmacy.repository.ProductRepository;
import com.project.pharmacy.repository.UserRepository;
import com.project.pharmacy.repository.WishlistRepository;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.WishlistService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WishlistImpl implements WishlistService {
    private final WishlistRepository wishlistRepository;
    private final ProductMapper productMapper;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final FileMetadataRepository fileMetadataRepository;

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
                    ProductResponse response = productMapper.toProductResponse(product);
                    Boolean isInWishList = wishlistRepository.existsByProductAndUser(product, user);
                    response.setInWishlist(isInWishList);
                    FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(product.getThumbnail()))
                            .orElseThrow(() -> new CustomException(ErrorCode.FILE_NOT_FOUND,
                                    HttpStatus.NOT_FOUND, "File không tồn tại"));
                    response.setThumbnailUrl(fileMetadata.getUrl());
                    return response;
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
}
