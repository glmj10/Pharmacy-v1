package com.pharmacy_backend.product_service.repository;

import com.pharmacy_backend.product_service.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    @Query(value = "SELECT pr FROM ProductRating pr WHERE pr.product.id = :productId", nativeQuery = true)
    List<Comment> findByProductId(Long productId);

    Page<Comment> findAllByProductId(Long productId, Pageable pageable);
}
