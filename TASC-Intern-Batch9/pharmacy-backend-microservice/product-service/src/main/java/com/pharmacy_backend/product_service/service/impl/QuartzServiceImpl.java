package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.enums.JobKeyEnum;
import com.pharmacy_backend.product_service.config.PromotionExpirationJob;
import com.pharmacy_backend.product_service.config.PromotionActivationJob;
import com.pharmacy_backend.product_service.service.QuartzService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuartzServiceImpl implements QuartzService {
    private final Scheduler scheduler;

    @Override
    public void removeScheduledPromotionActivation(Long promoId) {
        try {
            JobKey startKey = JobKey.jobKey(JobKeyEnum.PROMOTION_START.getKey() + "_" + promoId,
                    "promotion-group");
            JobKey endKey = JobKey.jobKey(JobKeyEnum.PROMOTION_END.getKey() + "_" + promoId,
                    "promotion-group");

            boolean deletedStart = scheduler.deleteJob(startKey);

            boolean deletedEnd = scheduler.deleteJob(endKey);

            log.info("Đã dọn dẹp lịch Quartz cho Promo {}. Start deleted: {}, End deleted: {}",
                    promoId, deletedStart, deletedEnd);

        } catch (SchedulerException e) {
            log.error("Lỗi khi xóa lịch Quartz cho Promo {}", promoId, e);
        }
    }

    @Override
    public void schedulePromotionTime(Long promotionId, JobKeyEnum key, LocalDateTime time) {
        try {
            String jobIdentity = key.name() + "_" + promotionId;
            String triggerIdentity = key.name() + "_trigger_" + promotionId;

            Class<? extends Job> jobClass = (key == JobKeyEnum.PROMOTION_START)
                    ? PromotionActivationJob.class
                    : PromotionExpirationJob.class;

            JobDetail jobDetail = JobBuilder.newJob(jobClass)
                    .withIdentity(jobIdentity, "promotion-group")
                    .usingJobData("promotionId", String.valueOf(promotionId))
                    .usingJobData("jobType", key.name())
                    .storeDurably()
                    .build();

            Date startAt = Date.from(time.atZone(ZoneId.systemDefault()).toInstant());

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerIdentity, "promotion-group")
                    .startAt(startAt)
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withMisfireHandlingInstructionFireNow())
                    .build();

            if (scheduler.checkExists(jobDetail.getKey())) {
                scheduler.deleteJob(jobDetail.getKey());
            }

            scheduler.scheduleJob(jobDetail, trigger);

            log.info("Quartz đã lên lịch [{}] cho ID {} vào lúc {}", key, promotionId, time);

        } catch (SchedulerException e) {
            throw new RuntimeException("Lỗi lên lịch Quartz cho " + key, e);
        }
    }
}
