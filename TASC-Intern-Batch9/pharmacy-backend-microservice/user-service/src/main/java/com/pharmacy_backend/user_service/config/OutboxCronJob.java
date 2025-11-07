package com.pharmacy_backend.user_service.config;

import com.pharmacy_backend.common.service.OutboxService;
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
