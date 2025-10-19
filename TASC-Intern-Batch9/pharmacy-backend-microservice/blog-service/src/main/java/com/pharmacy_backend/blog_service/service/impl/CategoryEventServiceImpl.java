package com.pharmacy_backend.blog_service.service.impl;

import com.pharmacy_backend.blog_service.entity.Category;
import com.pharmacy_backend.blog_service.repository.CategoryRepository;
import com.pharmacy_backend.blog_service.service.CategoryEventService;
import com.pharmacy_backend.common.kafka.event.CategoryEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryEventServiceImpl implements CategoryEventService {
    private final CategoryRepository categoryRepository;

    @Override
    public void createCategory(CategoryEvent event) {
        Category category = new Category();
        category.setId(event.getCategoryId());
        category.setName(event.getName());
        category.setSlug(category.getSlug());
        categoryRepository.save(category);
    }

    @Override
    public void updateCategory(CategoryEvent event) {
        Category category = new Category();
        category.setId(event.getCategoryId());
        category.setName(event.getName());
        category.setSlug(category.getSlug());
        categoryRepository.save(category);
    }

    @Override
    public void deleteCategory(CategoryEvent event) {
        Category category = new Category();
        category.setId(event.getCategoryId());
        category.setName(event.getName());
        category.setSlug(category.getSlug());
        categoryRepository.delete(category);
    }
}
