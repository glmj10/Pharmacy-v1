package com.pharmacy_backend.order_service.service;

import com.pharmacy_backend.common.enums.JobKeyEnum;

import java.time.LocalDateTime;

public interface QuartzService {
    void scheduleJob(Long voucherId, JobKeyEnum key, LocalDateTime time);
    void removeJob(Long voucherId);
}
