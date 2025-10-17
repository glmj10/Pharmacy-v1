package com.pharmacy_backend.common.kafka.event;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserForgotPasswordEvent {
    private String email;
    private String resetPasswordToken;
    private LocalDateTime expiryAt;
    private boolean isUser;
}
