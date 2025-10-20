package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.User;
import com.pharmacy_backend.product_service.entity.Wishlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findAllByUser_Id(Long userId);

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    List<Wishlist> findAllByUser(User user);

    Boolean existsByProductAndUser(Product product, User user);

    boolean existsByUserAndProduct(User user, Product product);
}
