package com.pharmacy_backend.cms_service.controller;

import com.pharmacy_backend.cms_service.dto.request.ContactRequest;
import com.pharmacy_backend.cms_service.dto.response.ContactResponse;
import com.pharmacy_backend.cms_service.dto.response.PageResponse;
import com.pharmacy_backend.cms_service.service.ContactService;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/contacts")
public class ContactController {
    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContactResponse>> sendContactMessage(@RequestBody @Valid ContactRequest request) {
        ApiResponse<ContactResponse> response = contactService.sendContactMessage(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<List<ContactResponse>>>> getContactMessages(@RequestParam(value = "pageIndex", defaultValue = "1") int pageIndex,
                                                                                               @RequestParam(value = "pageSize", defaultValue = "10") int pageSize,
                                                                                               @RequestParam(value = "status", required = false) Boolean status){
        ApiResponse<PageResponse<List<ContactResponse>>> response = contactService.getContactMessages(pageIndex, pageSize, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> getContactMessageById(@PathVariable Long id) {
        ApiResponse<ContactResponse> response = contactService.getContactMessageById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContactResponse>> changeContactStatus(@PathVariable Long id, @RequestParam Boolean status) {
        ApiResponse<ContactResponse> response = contactService.changeContactStatus(id, status);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
