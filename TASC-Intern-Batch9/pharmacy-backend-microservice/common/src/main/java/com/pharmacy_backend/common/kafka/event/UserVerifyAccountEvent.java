package com.pharmacy_backend.common.kafka.event;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserVerifyAccountEvent {
    private String email;
    private String verificationToken;
    private LocalDateTime expiryAt;
}
