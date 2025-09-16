package com.project.pharmacy.service.impl;

import com.project.pharmacy.dto.request.CartItemRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.CartItemResponse;
import com.project.pharmacy.dto.response.CartResponse;
import com.project.pharmacy.dto.response.ProductResponse;
import com.project.pharmacy.entity.*;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.mapper.ProductMapper;
import com.project.pharmacy.repository.*;
import com.project.pharmacy.security.SecurityUtils;
import com.project.pharmacy.service.CartService;
import com.project.pharmacy.utils.NumberUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.Synchronized;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartServiceImpl implements CartService {
    CartRepository cartRepository;
    ProductMapper productMapper;
    CartItemRepository cartItemRepository;
    UserRepository userRepository;
    ProductRepository productRepository;
    FileMetadataRepository fileMetadataRepository;

    @Override
    public void createCart(User user) {
        try {
            Cart cart = new Cart();
            cart.setUser(user);
            cartRepository.createCart(cart);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    @Override
    public ApiResponse<CartResponse> getCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> items = cartItemRepository.findByCart(cart);

        List<CartItemResponse> itemResponses = items.stream()
                .filter(cartItem -> cartItem.getProduct() != null) // Add null check for product
                .map(cartItem -> {
                    CartItemResponse cartItemResponse = CartItemResponse.builder()
                            .id(cartItem.getId())
                            .quantity(cartItem.getQuantity())
                            .priceAtAddition(cartItem.getPriceAtAddition())
                            .priceDifferent(Math.abs(cartItem.getPriceAtAddition() - cartItem.getProduct().getPriceNew()))
                            .priceChangeType(NumberUtils.toPriceChangeType(cartItem.getProduct().getPriceNew() - cartItem.getPriceAtAddition()))
                            .isOutOfStock(cartItem.isOutOfStock())
                            .selected(cartItem.getSelected())
                            .build();
                    ProductResponse productResponse = productMapper.toProductResponse(cartItem.getProduct());

                    // Add null check for thumbnail
                    if (cartItem.getProduct().getThumbnail() != null) {
                        try {
                            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(
                                            cartItem.getProduct().getThumbnail()))
                                    .orElse(null);
                            if (fileMetadata != null) {
                                productResponse.setThumbnailUrl(fileMetadata.getUrl());
                            }
                        } catch (IllegalArgumentException e) {
                            // Handle invalid UUID format gracefully
                            productResponse.setThumbnailUrl(null);
                        }
                    }

                    cartItemResponse.setProduct(productResponse);
                    return cartItemResponse;
                })
                .toList();

        CartResponse response = new CartResponse(cart.getId(), cart.getTotalPrice(), itemResponses);
        return ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm trong giỏ hàng thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không hợp lệ"));
        if(request.getQuantity() <= 0) {
            throw new CustomException(ErrorCode.BAD_REQUEST, HttpStatus.BAD_REQUEST,
                    "Số lượng sản phẩm phải lớn hơn 0");
        }

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm không tồn tại"));

        if(product.getActive() == null || !product.getActive()) {
            throw new CustomException(ErrorCode.PRODUCT_INACTIVE,
                    HttpStatus.BAD_REQUEST, "Sản phẩm hiện không khả dụng");
        }

        if (product.getQuantity() < request.getQuantity()) {
            throw new CustomException(ErrorCode.INSUFFICIENT_PRODUCT_QUANTITY,
                    HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ");
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        CartItem existingItem = cartItemRepository.findByCartAndProduct(cart, product)
                .orElse(null);

        if (existingItem != null) {
            existingItem.setQuantity(
                    (existingItem.getQuantity() + request.getQuantity() > product.getQuantity())
                            ? product.getQuantity()
                            : existingItem.getQuantity() + request.getQuantity()
            );
            existingItem.setPriceAtAddition(product.getPriceNew());
            existingItem = cartItemRepository.create(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setProduct(product);
            newItem.setQuantity(request.getQuantity());
            newItem.setPriceAtAddition(product.getPriceNew());
            newItem.setCart(cart);
            newItem.setCreatedAt(LocalDateTime.now());
            cart.getCartItems().add(newItem);
            existingItem = cartItemRepository.create(newItem);
        }

        CartItemResponse response = CartItemResponse.builder()
                .id(existingItem.getId())
                .product(productMapper.toProductResponse(product))
                .quantity(existingItem.getQuantity())
                .priceAtAddition(product.getPriceNew())
                .build();

        return ApiResponse.buildCreatedResponse(response,
                "Thêm sản phẩm vào giỏ hàng thành công");
    }

    @Override
    @Transactional
    public ApiResponse<CartItemResponse> updateItemQuantity(Long itemId, Integer quantity) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ hàng không tồn tại"));

        if (item.getProduct().getQuantity() < quantity) {
            throw new CustomException(ErrorCode.INSUFFICIENT_PRODUCT_QUANTITY,
                    HttpStatus.BAD_REQUEST, "Số lượng sản phẩm không đủ");
        }

        if(item.isSelected()) {
            cart.setTotalPrice(
                    item.getQuantity() < quantity ?
                            cart.getTotalPrice() + ((long) item.getProduct().getPriceNew() * (quantity - item.getQuantity())) :
                            cart.getTotalPrice() - (long) item.getProduct().getPriceNew() * (item.getQuantity() - quantity)
            );
        }
        item.setQuantity(quantity);

        cartItemRepository.create(item);
        cartRepository.updateCart(cart);

        CartItemResponse response = CartItemResponse.builder()
                .id(item.getId())
                .product(productMapper.toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .priceAtAddition(item.getPriceAtAddition())
                .build();

        return ApiResponse.buildOkResponse(response,
                "Cập nhật số lượng sản phẩm trong giỏ hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> removeItemFromCart(Long itemId) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ hàng không tồn tại"));

        cartItemRepository.remove(item);
        if(item.getSelected()) {
            cart.setTotalPrice(cart.getTotalPrice() - (long) item.getProduct().getPriceNew() * item.getQuantity());
        }
        cartRepository.updateCart(cart);

        return ApiResponse.buildOkResponse(null, "Xóa sản phẩm khỏi giỏ hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<Void> clearCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> cartItems = cartItemRepository.findAllByCart(cart);
        cartItems.forEach(item -> {
            if (item.getSelected()) {
                cart.setTotalPrice(cart.getTotalPrice() - (long) item.getProduct().getPriceNew() * item.getQuantity());
            }
        });

        cartItemRepository.removeAll(cartItems);
        cart.getCartItems().clear();
        cartRepository.updateCart(cart);

        return ApiResponse.buildOkResponse(null, "Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<CartItemResponse> changeItemSelection(Long itemId, Boolean status) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        CartItem item = cartItemRepository.findByCartAndId(cart, itemId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Sản phẩm trong giỏ hàng không tồn tại"));

        if(status && item.isOutOfStock()) {
            throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK,
                    HttpStatus.BAD_REQUEST, "Sản phẩm hiện không có sẵn");
        }

        if(!item.getSelected().equals(status)) {
            item.setSelected(status);
            cart.setTotalPrice(cart.getTotalPrice() + (item.isSelected()
                    ? (long) item.getProduct().getPriceNew() * item.getQuantity()
                    : (long) -item.getProduct().getPriceNew() * item.getQuantity()));
            cartItemRepository.updateCartItem(item);
            cartRepository.updateCart(cart);
        }

        CartItemResponse response = CartItemResponse.builder()
                .id(item.getId())
                .product(productMapper.toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .priceAtAddition(item.getPriceAtAddition())
                .selected(item.getSelected())
                .isOutOfStock(item.isOutOfStock())
                .priceDifferent(Math.abs(item.getPriceAtAddition() - item.getProduct().getPriceNew()))
                .build();

        return ApiResponse.buildOkResponse(response,
                "Cập nhật trạng thái sản phẩm trong giỏ hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<CartItemResponse>> selectAllItems(Boolean status) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> items = cartItemRepository.findAllByCartAndSelected(cart, !status);

        items.forEach(item -> {
            boolean wasSelected = item.isSelected();

            if (wasSelected != status) {
                item.setSelected(status);
                long change = (long) item.getProduct().getPriceNew() * item.getQuantity();
                if (status) {
                    cart.setTotalPrice(cart.getTotalPrice() + change);
                } else {
                    cart.setTotalPrice(cart.getTotalPrice() - change);
                }
                cartItemRepository.updateCartItem(item);
            }
        });

        cartRepository.updateCart(cart);

        List<CartItemResponse> responses = items.stream()
                .map(item -> CartItemResponse.builder()
                        .id(item.getId())
                        .product(productMapper.toProductResponse(item.getProduct()))
                        .quantity(item.getQuantity())
                        .priceAtAddition(item.getPriceAtAddition())
                        .selected(item.getSelected())
                        .isOutOfStock(item.isOutOfStock())
                        .priceDifferent(Math.abs(item.getPriceAtAddition() - item.getProduct().getPriceNew()))
                        .build())
                .toList();

        return ApiResponse.buildOkResponse(responses,
                (status ? "Chọn tất cả" : "Bỏ chọn tất cả") + " sản phẩm trong giỏ hàng thành công");
    }

    @Transactional
    @Override
    public ApiResponse<List<CartResponse>> getCartItemsForCheckout() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> items = cartItemRepository.findAllByCartAndSelected(cart, true);

        List<CartItemResponse> itemResponses = items.stream()
                .filter(cartItem -> cartItem.getProduct() != null) // Add null check for product
                .map(cartItem -> {
                    CartItemResponse cartItemResponse = CartItemResponse.builder()
                            .id(cartItem.getId())
                            .quantity(cartItem.getQuantity())
                            .priceAtAddition(cartItem.getPriceAtAddition())
                            .priceDifferent(Math.abs(cartItem.getPriceAtAddition() - cartItem.getProduct().getPriceNew()))
                            .priceChangeType(NumberUtils.toPriceChangeType(cartItem.getProduct().getPriceNew() - cartItem.getPriceAtAddition()))
                            .isOutOfStock(cartItem.isOutOfStock())
                            .selected(cartItem.getSelected())
                            .build();
                    ProductResponse productResponse = productMapper.toProductResponse(cartItem.getProduct());

                    if (cartItem.getProduct().getThumbnail() != null) {
                        try {
                            FileMetadata fileMetadata = fileMetadataRepository.findByUuid(UUID.fromString(
                                            cartItem.getProduct().getThumbnail()))
                                    .orElse(null);
                            if (fileMetadata != null) {
                                productResponse.setThumbnailUrl(fileMetadata.getUrl());
                            }
                        } catch (IllegalArgumentException e) {
                            // Handle invalid UUID format gracefully
                            productResponse.setThumbnailUrl(null);
                        }
                    }

                    cartItemResponse.setProduct(productResponse);
                    return cartItemResponse;
                })
                .toList();

        CartResponse response = new CartResponse(cart.getId(), cart.getTotalPrice(), itemResponses);
        return ApiResponse.<List<CartResponse>>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm trong giỏ hàng thành công")
                .data(List.of(response))
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<Long> getTotalItemsInCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> items = cartItemRepository.findAllByCart(cart);

        Long totalItems = items.stream()
                .mapToLong(CartItem::getQuantity)
                .sum();

        return ApiResponse.<Long>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy tổng số sản phẩm trong giỏ hàng thành công")
                .data(totalItems)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
