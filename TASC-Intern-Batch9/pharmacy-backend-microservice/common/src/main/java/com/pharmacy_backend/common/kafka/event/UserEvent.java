package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class UserEvent {
    private Long userId;
    private String username;
    private String email;
    private String profilePicUrl;
}
