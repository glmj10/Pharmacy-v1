package com.pharmacy_backend.identity_service.dto.request;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserSearchCriteria {
    private String email;
    private String roleCode;
    private boolean isActive;
}
