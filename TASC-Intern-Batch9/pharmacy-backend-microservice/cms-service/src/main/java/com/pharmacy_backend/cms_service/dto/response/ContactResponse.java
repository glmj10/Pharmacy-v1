package com.pharmacy_backend.cms_service.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ContactResponse {
    Long id;
    String fullName;
    String email;
    String phoneNumber;
    String address;
    String content;
    Boolean active;
    LocalDateTime createdAt;
}
