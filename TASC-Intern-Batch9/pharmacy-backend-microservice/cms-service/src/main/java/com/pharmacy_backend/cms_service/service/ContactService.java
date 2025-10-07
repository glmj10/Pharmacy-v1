package com.pharmacy_backend.cms_service.service;


import com.pharmacy_backend.cms_service.dto.request.ContactRequest;
import com.pharmacy_backend.cms_service.dto.response.ContactResponse;
import com.pharmacy_backend.cms_service.dto.response.PageResponse;
import com.pharmacy_backend.common.dto.response.ApiResponse;

import java.util.List;

public interface ContactService {
    ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status);
    ApiResponse<ContactResponse> getContactMessageById(Long id);
    ApiResponse<ContactResponse> sendContactMessage(ContactRequest request);
    ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status);
}
