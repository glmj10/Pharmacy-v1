package com.project.pharmacy.mapper;

import com.project.pharmacy.dto.request.ContactRequest;
import com.project.pharmacy.dto.response.ContactResponse;
import com.project.pharmacy.entity.Contact;
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
