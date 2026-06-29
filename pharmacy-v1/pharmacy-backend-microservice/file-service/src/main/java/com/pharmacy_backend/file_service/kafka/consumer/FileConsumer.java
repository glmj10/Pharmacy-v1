package com.pharmacy_backend.file_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.FileEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.file_service.service.impl.FileMinioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class FileConsumer {
    private final ObjectMapper objectMapper;
    private final FileMinioService fileMinioService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.file-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeFileEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.FILE_DELETED.getName())) {
                FileEvent fileEvent = objectMapper.convertValue(event.getData(),
                        FileEvent.class);
                fileMinioService.deleteFile(fileEvent.getFileUUID());
            }

            log.info("Received file event: {}", event);
            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
