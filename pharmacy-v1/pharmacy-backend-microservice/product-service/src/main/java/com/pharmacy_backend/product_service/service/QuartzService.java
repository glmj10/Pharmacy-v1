package com.pharmacy_backend.product_service.service;

import com.pharmacy_backend.common.enums.JobKeyEnum;

import java.time.LocalDateTime;

public interface QuartzService {
    void removeScheduledPromotionActivation(Long promoId);
    void schedulePromotionTime(Long promotionId, JobKeyEnum key, LocalDateTime time);
}
