package com.pharmacy_backend.user_service.mapper;

import com.pharmacy_backend.user_service.dto.request.ContactRequest;
import com.pharmacy_backend.user_service.dto.response.ContactResponse;
import com.pharmacy_backend.user_service.entity.Contact;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ContactMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Contact toContact(ContactRequest request);

    @Mapping(target = "active", ignore = true)
    ContactResponse toContactResponse(Contact contact);
}
