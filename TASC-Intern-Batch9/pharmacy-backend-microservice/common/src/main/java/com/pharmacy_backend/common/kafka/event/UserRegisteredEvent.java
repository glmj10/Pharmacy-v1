package com.pharmacy_backend.common.kafka.event;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class UserRegisteredEvent {
    private Long userId;
}
