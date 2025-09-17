package com.project.pharmacy.service;

import com.project.pharmacy.dto.request.ContactRequest;
import com.project.pharmacy.dto.response.ApiResponse;
import com.project.pharmacy.dto.response.ContactResponse;
import com.project.pharmacy.dto.response.PageResponse;

import java.util.List;

public interface ContactService {
    ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status);
    ApiResponse<ContactResponse> getContactMessageById(Long id);
    ApiResponse<ContactResponse> sendContactMessage(ContactRequest request);
    ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status);
}
