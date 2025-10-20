package com.pharmacy_backend.category_service.config;

import com.pharmacy_backend.category_service.service.OutboxService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OutboxCronJob {
    private final OutboxService outboxService;
    @Scheduled(fixedRateString = "${outbox.cron-job-rate-ms}")
    public void processOutboxMessages() {
        outboxService.publishPendingEvents();
    }
}
