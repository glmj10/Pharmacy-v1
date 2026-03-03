package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.User;
import com.pharmacy_backend.product_service.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    List<Wishlist> findAllByUser_Id(Long userId);

    Optional<Wishlist> findByUserAndProduct(User user, Product product);

    @Query("SELECT w FROM Wishlist w WHERE w.user = :user AND w.product.id IN :productIds")
    Optional<List<Wishlist>> findAllByUserAndProductIds(User user, List<Long> productIds);

    List<Wishlist> findAllByUser(User user);
    Page<Wishlist> findAllByUser(User user, Pageable pageable);

    Boolean existsByProductAndUser(Product product, User user);

    boolean existsByUserAndProduct(User user, Product product);
}
