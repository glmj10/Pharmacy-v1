package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Product;
import com.project.pharmacy.entity.User;
import com.project.pharmacy.entity.Wishlist;
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
