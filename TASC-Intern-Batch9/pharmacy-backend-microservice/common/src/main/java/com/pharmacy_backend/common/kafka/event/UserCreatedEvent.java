package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
public class UserCreatedEvent {
    private Long userId;
    private String email;
}
