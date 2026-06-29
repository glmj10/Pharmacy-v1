package com.pharmacy_backend.common.kafka.event;


import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class CategoryEvent {
    private Long categoryId;
    private String name;
    private String typeCode;
    private Long parentId;
    private String slug;
}
