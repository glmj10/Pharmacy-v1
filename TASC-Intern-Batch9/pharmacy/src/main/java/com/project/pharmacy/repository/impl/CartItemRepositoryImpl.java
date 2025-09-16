package com.project.pharmacy.repository.impl;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.CartItem;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.enums.ErrorCode;
import com.project.pharmacy.exceptions.CustomException;
import com.project.pharmacy.repository.CartItemRepository;
import com.project.pharmacy.repository.ProductRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CartItemRepositoryImpl implements CartItemRepository {
    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;
    private final ProductRepository productRepository;

    @Override
    public CartItem create(CartItem cartItem) {
        String sql = "INSERT INTO cart_items (cart_id, product_id, quantity, selected, price_at_addition, created_at, total_price) " +
                "VALUES (:cartId, :productId, :quantity, :selected, :priceAtAddition, :createdAt, :totalPrice)";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cartItem.getCart().getId())
                .addValue("productId", cartItem.getProduct().getId())
                .addValue("quantity", cartItem.getQuantity())
                .addValue("selected", cartItem.getSelected())
                .addValue("priceAtAddition", cartItem.getPriceAtAddition())
                .addValue("createdAt", cartItem.getCreatedAt())
                .addValue("totalPrice", cartItem.getTotalPrice());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update(sql, params, keyHolder, new String[]{"id"});
        return cartItem;
    }

    @Override
    public void updateCartItem(CartItem cartItem) {
        String sql = "UPDATE cart_items " +
                "SET quantity = :quantity, selected = :selected, price_at_addition = :priceAtAddition " +
                "WHERE id = :id";

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", cartItem.getId())
                .addValue("quantity", cartItem.getQuantity())
                .addValue("selected", cartItem.getSelected())
                .addValue("priceAtAddition", cartItem.getPriceAtAddition());

        namedParameterJdbcTemplate.update(sql, params);
    }

    @Override
    public void remove(CartItem cartItem) {
        String sql = "DELETE FROM cart_items WHERE id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("id", cartItem.getId());
        namedParameterJdbcTemplate.update(sql, params);
    }

    @Override
    public void removeAll(List<CartItem> cartItems) {
        List<Long> ids = cartItems.stream().map(CartItem::getId).toList();
        if (ids.isEmpty()) {
            throw new CustomException(ErrorCode.BUSINESS_ERROR,
                    HttpStatus.BAD_REQUEST, "No cart items to delete");
        }

        String sql = "DELETE FROM cart_items WHERE id IN (:ids)";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("ids", ids);

        namedParameterJdbcTemplate.update(sql, params);
    }


    @Override
    public List<CartItem> findByCart(Cart cart) {
        String sql = "SELECT ci.id, ci.quantity, ci.selected, ci.price_at_addition, ci.product_id " +
                "FROM cart_items ci " +
                "JOIN products p ON ci.product_id = p.id " +
                "WHERE ci.cart_id = :cartId ORDER BY ci.created_at DESC";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cart.getId());
        return namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
            CartItem cartItem = new CartItem();
            cartItem.setId(rs.getLong("id"));
            cartItem.setQuantity(rs.getInt("quantity"));
            cartItem.setSelected(rs.getBoolean("selected"));
            cartItem.setPriceAtAddition(rs.getObject("price_at_addition", Integer.class));
            cartItem.setCart(cart);

            Long productId = rs.getLong("product_id");
            Product product = productRepository.findById(productId).orElse(null);
            cartItem.setProduct(product);

            return cartItem;
        });
    }

    @Override
    public Optional<CartItem> findByCartAndProduct(Cart cart, Product product) {
        String sql = "SELECT ci.id, ci.quantity, ci.selected, ci.price_at_addition, ci.product_id " +
                "FROM cart_items ci " +
                "JOIN carts c ON ci.cart_id = c.id " +
                "JOIN products p ON ci.product_id = p.id " +
                "WHERE ci.cart_id = :cartId AND ci.product_id = :productId";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cart.getId())
                .addValue("productId", product.getId());
        List<CartItem> cartItems = namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
            CartItem cartItem = new CartItem();
            cartItem.setId(rs.getLong("id"));
            cartItem.setQuantity(rs.getInt("quantity"));
            cartItem.setSelected(rs.getBoolean("selected"));
            cartItem.setPriceAtAddition(rs.getObject("price_at_addition", Integer.class));
            cartItem.setCart(cart); // Set the cart relationship
            cartItem.setProduct(product); // Set the product relationship
            return cartItem;
        });
        if (cartItems.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(cartItems.get(0));
        }
    }

    @Override
    public Optional<CartItem> findByCartAndId(Cart cart, Long id) {
        String sql = "SELECT ci.id, ci.quantity, ci.selected, ci.price_at_addition, ci.product_id " +
                "FROM cart_items ci " +
                "JOIN carts c ON ci.cart_id = c.id " +
                "WHERE ci.cart_id = :cartId AND ci.id = :id";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cart.getId())
                .addValue("id", id);
        List<CartItem> cartItems = namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
            CartItem cartItem = new CartItem();
            cartItem.setId(rs.getLong("id"));
            cartItem.setQuantity(rs.getInt("quantity"));
            cartItem.setSelected(rs.getBoolean("selected"));
            cartItem.setPriceAtAddition(rs.getObject("price_at_addition", Integer.class));
            cartItem.setCart(cart); // Set the cart relationship

            // Load the product relationship
            Long productId = rs.getLong("product_id");
            Product product = productRepository.findById(productId).orElse(null);
            cartItem.setProduct(product);

            return cartItem;
        });
        if (cartItems.isEmpty()) {
            return Optional.empty();
        } else {
            return Optional.of(cartItems.get(0));
        }
    }

    @Override
    public List<CartItem> findAllByCartAndSelected(Cart cart, Boolean isSelected) {
        String sql = "SELECT ci.id, ci.quantity, ci.selected, ci.price_at_addition, ci.product_id " +
                "FROM cart_items ci " +
                "JOIN carts c ON c.id = ci.cart_id " +
                "WHERE ci.cart_id = :cartId AND ci.selected = :selected";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cart.getId())
                .addValue("selected", isSelected);
        return namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
            CartItem cartItem = new CartItem();
            cartItem.setId(rs.getLong("id"));
            cartItem.setQuantity(rs.getInt("quantity"));
            cartItem.setSelected(rs.getBoolean("selected"));
            cartItem.setPriceAtAddition(rs.getObject("price_at_addition", Integer.class));
            cartItem.setCart(cart); // Set the cart relationship

            // Load the product relationship
            Long productId = rs.getLong("product_id");
            Product product = productRepository.findById(productId).orElse(null);
            cartItem.setProduct(product);

            return cartItem;
        });
    }

    @Override
    public List<CartItem> findAllByCart(Cart cart) {
        String sql = "SELECT ci.id, ci.quantity, ci.selected, ci.price_at_addition, ci.product_id " +
                "FROM cart_items ci " +
                "JOIN carts c ON c.id = ci.cart_id " +
                "WHERE ci.cart_id = :cartId ORDER BY ci.created_at DESC";
        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("cartId", cart.getId());
        return namedParameterJdbcTemplate.query(sql, params, (rs, rowNum) -> {
            CartItem cartItem = new CartItem();
            cartItem.setId(rs.getLong("id"));
            cartItem.setQuantity(rs.getInt("quantity"));
            cartItem.setSelected(rs.getBoolean("selected"));
            cartItem.setPriceAtAddition(rs.getObject("price_at_addition", Integer.class));
            cartItem.setCart(cart); // Set the cart relationship

            // Load the product relationship
            Long productId = rs.getLong("product_id");
            Product product = productRepository.findById(productId).orElse(null);
            cartItem.setProduct(product);

            return cartItem;
        });
    }
}
