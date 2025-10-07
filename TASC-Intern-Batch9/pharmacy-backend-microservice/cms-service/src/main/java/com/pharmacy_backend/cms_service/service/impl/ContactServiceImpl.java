package com.pharmacy_backend.cms_service.service.impl;

import com.pharmacy_backend.cms_service.dto.request.ContactRequest;
import com.pharmacy_backend.cms_service.dto.response.ContactResponse;
import com.pharmacy_backend.cms_service.dto.response.PageResponse;
import com.pharmacy_backend.cms_service.entity.Contact;
import com.pharmacy_backend.cms_service.mapper.ContactMapper;
import com.pharmacy_backend.cms_service.repository.ContactRepository;
import com.pharmacy_backend.cms_service.service.ContactService;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {
    private final ContactRepository contactRepository;
    private final ContactMapper contactMapper;

    @Override
    public ApiResponse<PageResponse<List<ContactResponse>>> getContactMessages(int pageIndex, int pageSize, Boolean status) {
        if(pageIndex <= 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Contact> contactPage = status != null
                ? contactRepository.findAllByActive(status, pageable)
                : contactRepository.findAll(pageable);

        List<ContactResponse> contactResponses = contactPage.getContent().stream()
                .map(contact -> {
                    ContactResponse response = contactMapper.toContactResponse(contact);
                    response.setActive(contact.getActive());
                    return response;
                }).toList();

        PageResponse<List<ContactResponse>> pageResponse = PageResponse.<List<ContactResponse>>builder()
                .content(contactResponses)
                .currentPage(pageIndex)
                .totalElements(contactPage.getTotalElements())
                .totalPages(contactPage.getTotalPages())
                .hasNext(contactPage.hasNext())
                .hasPrevious(contactPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách yêu cầu tư vấn thành công");
    }

    @Override
    public ApiResponse<ContactResponse> getContactMessageById(Long id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTACT_NOT_FOUND,
                        HttpStatus.NOT_FOUND, "Không tìm thấy yêu cầu tư vấn"));

        ContactResponse response = contactMapper.toContactResponse(contact);
        response.setActive(contact.getActive());

        return ApiResponse.buildOkResponse(response, "Lấy thông tin yêu cầu tư vấn thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ContactResponse> sendContactMessage(ContactRequest request) {
        Contact contact = contactMapper.toContact(request);

        Contact savedContact = contactRepository.save(contact);
        ContactResponse response = contactMapper.toContactResponse(savedContact);

        return ApiResponse.buildCreatedResponse(response, "Gửi yêu cầu tư vấn thành công");
    }

    @Transactional
    @Override
    public ApiResponse<ContactResponse> changeContactStatus(Long id, Boolean status) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        contact.setActive(status);
        Contact updatedContact = contactRepository.save(contact);
        ContactResponse response = contactMapper.toContactResponse(updatedContact);
        response.setActive(updatedContact.getActive());

        return ApiResponse.buildOkResponse(response, "Cập nhật trạng thái yêu cầu tư vấn thành công");
    }
}
