package com.pharmacy_backend.product_service.repository;


import com.pharmacy_backend.product_service.entity.Category;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.Type;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    boolean existsBySlug(String slug);

    Optional<Category> findBySlug(String parentSlug);

    List<Category> findByParent(Category parent);

    List<Category> findByType(Type type);

    List<Category> findAllByProductsContains(Product product);

    @Query("""
            SELECT c FROM Category c
            JOIN c.products p
            WHERE p.id = :productId
    """)
    List<Category> findAllByProductId(@Param("productId") Long productId);
}
