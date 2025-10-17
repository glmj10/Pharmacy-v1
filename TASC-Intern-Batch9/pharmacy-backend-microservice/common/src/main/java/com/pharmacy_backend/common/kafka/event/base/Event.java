package com.pharmacy_backend.common.kafka.event.base;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Event<T> {
    @Builder.Default
    private String eventId = UUID.randomUUID().toString();
    private String eventType;
    private String source;
    private String key;
    private T data;

    @Builder.Default
    private LocalDateTime timeStamp = LocalDateTime.now();
}