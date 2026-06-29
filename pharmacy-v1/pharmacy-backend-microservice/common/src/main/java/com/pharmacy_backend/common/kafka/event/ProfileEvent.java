package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileEvent {
    private Long profileId;
    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String address;
}
