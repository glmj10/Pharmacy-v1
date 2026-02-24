package com.pharmacy_backend.common.kafka.event;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class FileEvent {
    private String fileUUID;
}
