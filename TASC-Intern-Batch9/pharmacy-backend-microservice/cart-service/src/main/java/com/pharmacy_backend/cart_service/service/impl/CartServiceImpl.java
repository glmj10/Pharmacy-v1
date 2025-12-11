package com.pharmacy_backend.cart_service.service.impl;

import com.pharmacy_backend.cart_service.dto.request.CartItemRequest;
import com.pharmacy_backend.cart_service.dto.response.CartItemResponse;
import com.pharmacy_backend.cart_service.dto.response.CartResponse;
import com.pharmacy_backend.cart_service.dto.response.ProductResponse;
import com.pharmacy_backend.cart_service.entity.Cart;
import com.pharmacy_backend.cart_service.entity.CartItem;
import com.pharmacy_backend.cart_service.entity.Product;
import com.pharmacy_backend.cart_service.entity.User;
import com.pharmacy_backend.cart_service.mapper.ProductMapper;
import com.pharmacy_backend.cart_service.repository.CartItemRepository;
import com.pharmacy_backend.cart_service.repository.CartRepository;
import com.pharmacy_backend.cart_service.repository.ProductRepository;
import com.pharmacy_backend.cart_service.repository.UserRepository;
import com.pharmacy_backend.cart_service.service.CartService;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.utils.NumberUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    final UserRepository userRepository;
    final CartRepository cartRepository;
    final CartItemRepository cartItemRepository;
    final ProductMapper productMapper;
    final ProductRepository productRepository;

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
                .filter(cartItem -> cartItem.getProduct() != null)
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

                    productResponse.setThumbnailUrl(cartItem.getProduct().getThumbnailUrl());

                    cartItemResponse.setProduct(productResponse);
                    return cartItemResponse;
                })
                .toList();

        CartResponse response = new CartResponse(cart.getId(), itemResponses);
        return ApiResponse.<CartResponse>builder()
                .status(HttpStatus.OK.value())
                .message("Lấy danh sách sản phẩm trong giỏ hàng thành công")
                .data(response)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Override
    public ApiResponse<CartItemResponse> addItemToCart(CartItemRequest request) {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Người dùng không hợp lệ"));

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
            cartItemRepository.updateCartItem(existingItem);
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

        item.setQuantity(quantity);

        cartItemRepository.updateCartItem(item);

        CartItemResponse response = CartItemResponse.builder()
                .id(item.getId())
                .product(productMapper.toProductResponse(item.getProduct()))
                .quantity(item.getQuantity())
                .priceAtAddition(item.getPriceAtAddition())
                .build();

        return ApiResponse.buildOkResponse(response,
                "Cập nhật số lượng sản phẩm trong giỏ hàng thành công");
    }

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

        return ApiResponse.buildOkResponse(null, "Xóa sản phẩm khỏi giỏ hàng thành công");
    }

    @Override
    public ApiResponse<Void> clearCart() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> cartItems = cartItemRepository.findAllByCart(cart);

        cartItemRepository.removeAll(cartItems);
        cart.getCartItems().clear();

        return ApiResponse.buildOkResponse(null, "Xóa tất cả sản phẩm khỏi giỏ hàng thành công");
    }

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
            cartItemRepository.updateCartItem(item);
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
                cartItemRepository.updateCartItem(item);
            }
        });

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

    @Override
    public ApiResponse<CartResponse> getCartItemsForCheckout() {
        User user = userRepository.findById(Objects.requireNonNull(SecurityUtils.getCurrentUserId()))
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND,
                        HttpStatus.UNAUTHORIZED, "Người dùng không hợp lệ"));
        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Giỏ hàng không tồn tại"));

        List<CartItem> items = cartItemRepository.findAllByCartAndSelected(cart, true);

        List<CartItemResponse> itemResponses = items.stream()
                .filter(cartItem -> cartItem.getProduct() != null)
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

                    productResponse.setThumbnailUrl(cartItem.getProduct().getThumbnailUrl());
                    cartItemResponse.setProduct(productResponse);
                    return cartItemResponse;
                })
                .toList();

        CartResponse response = new CartResponse(cart.getId(), itemResponses);
        return ApiResponse.buildOkResponse(response,
                "Lấy danh sách sản phẩm đã chọn trong giỏ hàng thành công");
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

    @Override
    public Cart createCart(Long userId) {
        User user  = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Cart cart = new Cart();
        cart.setUser(user);
        return cartRepository.createCart(cart);
    }
}
