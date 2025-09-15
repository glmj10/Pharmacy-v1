package com.project.pharmacy.repository;

import com.project.pharmacy.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long>, JpaSpecificationExecutor<Blog> {
    boolean existsBySlug(String slug);

    Optional<Blog> findBySlug(String slug);

}
