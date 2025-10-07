package com.pharmacy_backend.cms_service.repository;

import com.pharmacy_backend.cms_service.entity.Contact;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    Page<Contact> findAllByActive(Boolean active, Pageable pageable);
}
