package com.project.pharmacy.dto.response;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class TypeResponse {
    private Long id;
    private String code;
    private String name;
}
