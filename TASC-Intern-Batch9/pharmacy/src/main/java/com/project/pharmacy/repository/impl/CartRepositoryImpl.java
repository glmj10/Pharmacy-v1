package com.project.pharmacy.repository.impl;

import com.project.pharmacy.entity.Cart;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CartRepositoryImpl implements CartRepository {

    private final NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    @Override
    public boolean existsByUser(User user) {
        String sql = "SELECT COUNT(*) FROM carts WHERE user_id = :userId";
        MapSqlParameterSource parameterSource = new MapSqlParameterSource();
        parameterSource.addValue("userId", user.getId());

        Integer count = namedParameterJdbcTemplate.queryForObject(sql, parameterSource, Integer.class);
        return count != null && count > 0;
    }

    @Override
    public Optional<Cart> findByUser(User user) {
        String sql = "SELECT * FROM carts WHERE user_id = :userId";
        MapSqlParameterSource parameterSource = new MapSqlParameterSource();
        parameterSource.addValue("userId", user.getId());

        return namedParameterJdbcTemplate.query(sql, parameterSource, rs -> {
            if (rs.next()) {
                Cart cart = new Cart();
                cart.setId(rs.getLong("id"));
                cart.setUser(user); // Set the user relationship
                cart.setTotalPrice(rs.getLong("total_price")); // Set the total price
                return Optional.of(cart);
            }
            return Optional.empty();
        });
    }

    @Override
    public Cart createCart(Cart cart) {
        String sql = "INSERT INTO carts (user_id, total_price) VALUES(:userId, :totalPrice)";
        MapSqlParameterSource parameterSource = new MapSqlParameterSource();
        parameterSource.addValue("userId", cart.getUser().getId());
        parameterSource.addValue("totalPrice", cart.getTotalPrice());

        KeyHolder keyHolder = new GeneratedKeyHolder();
        namedParameterJdbcTemplate.update(sql, parameterSource, keyHolder, new String[]{"id"});

        // Set the generated ID back to the cart object
        if (keyHolder.getKey() != null) {
            cart.setId(keyHolder.getKey().longValue());
        }

        return cart;
    }

    @Override
    public Cart updateCart(Cart cart) {
        String sql = "UPDATE carts SET user_id = :userId, total_price = :totalPrice WHERE id = :id";
        MapSqlParameterSource parameterSource = new MapSqlParameterSource();
        parameterSource.addValue("userId", cart.getUser().getId());
        parameterSource.addValue("totalPrice", cart.getTotalPrice()); // Add totalPrice parameter
        parameterSource.addValue("id", cart.getId());

        namedParameterJdbcTemplate.update(sql, parameterSource);
        return cart;
    }

}
