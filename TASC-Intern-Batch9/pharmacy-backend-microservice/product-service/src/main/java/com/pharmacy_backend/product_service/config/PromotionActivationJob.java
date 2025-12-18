package com.pharmacy_backend.product_service.config;

import com.pharmacy_backend.common.enums.JobKeyEnum;
import com.pharmacy_backend.product_service.service.PromotionEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PromotionActivationJob extends QuartzJobBean {

    private final PromotionEventService promotionEventService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        String promotionIdStr = context.getJobDetail().getJobDataMap().getString( "promotionId");
        if(promotionIdStr != null) {
            Long promotionId = Long.parseLong(promotionIdStr);
            promotionEventService.activePromotion(promotionId);
        } else {
            log.error("Không tìm thấy promotionId trong JobDataMap");
        }
    }
}
