package com.pharmacy_backend.product_service.config;

import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.product_service.service.PromotionEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PromotionExpirationJob extends QuartzJobBean {

    private final PromotionEventService promotionEventService;

    @Override
    protected void executeInternal(JobExecutionContext context) throws JobExecutionException {
        String promotionIdStr = context.getJobDetail().getJobDataMap().getString( "promotionId");
        if(promotionIdStr != null) {
            Long promotionId = Long.parseLong(promotionIdStr);
            promotionEventService.changePromotionStatus(promotionId, PromotionEventStatusEnum.ENDED.getName());
        } else {
            log.error("Không tìm thấy promotionId trong JobDataMap");
        }
    }
}
