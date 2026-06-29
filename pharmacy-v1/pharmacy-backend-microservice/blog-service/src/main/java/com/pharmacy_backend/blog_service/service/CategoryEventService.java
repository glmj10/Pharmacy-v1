package com.pharmacy_backend.blog_service.service;


import com.pharmacy_backend.common.kafka.event.CategoryEvent;

public interface CategoryEventService {
    void createCategory(CategoryEvent event);
    void updateCategory(CategoryEvent event);
    void deleteCategory(CategoryEvent event);
}
