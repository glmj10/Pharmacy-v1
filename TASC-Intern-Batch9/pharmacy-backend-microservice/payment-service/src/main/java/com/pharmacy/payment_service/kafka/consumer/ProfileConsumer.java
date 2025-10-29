package com.pharmacy.payment_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.ProfileEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.service.ProfileEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ProfileConsumer {
    private final ObjectMapper objectMapper;
    private final ProfileEventService profileEventService;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.profile-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeProfileEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            String eventType = event.getEventType();

            if(eventType.equalsIgnoreCase(EventTypeEnum.PROFILE_UPDATED.getName())) {
                ProfileEvent profileEvent = objectMapper.convertValue(event.getData(), ProfileEvent.class);
                profileEventService.updateProfile(profileEvent);
            }

            if(eventType.equalsIgnoreCase(EventTypeEnum.PROFILE_CREATED.getName())) {
                ProfileEvent profileEvent = objectMapper.convertValue(event.getData(), ProfileEvent.class);
                profileEventService.createUserProfile(profileEvent);
            }

            if(eventType.equalsIgnoreCase(EventTypeEnum.PROFILE_DELETED.getName())) {
                ProfileEvent profileEvent = objectMapper.convertValue(event.getData(), ProfileEvent.class);
                profileEventService.deleteProfile(profileEvent);
            }

            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

}
