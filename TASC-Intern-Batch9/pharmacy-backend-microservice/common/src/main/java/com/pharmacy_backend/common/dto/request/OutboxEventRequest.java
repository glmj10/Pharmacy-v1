package com.pharmacy_backend.common.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OutboxEventRequest {
    Long aggregateId;
    String aggregateType;
    String eventType;
    String payload;
}
