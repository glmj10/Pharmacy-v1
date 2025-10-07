package com.pharmacy_backend.common.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OutboxEventSearchingRequest {

    private Long aggregateId;
    private String aggregateType;
}
