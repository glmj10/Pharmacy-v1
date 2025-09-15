package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Category;
import com.project.pharmacy.entity.Product;
import com.project.pharmacy.entity.Type;
import com.project.pharmacy.enums.CategoryTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
