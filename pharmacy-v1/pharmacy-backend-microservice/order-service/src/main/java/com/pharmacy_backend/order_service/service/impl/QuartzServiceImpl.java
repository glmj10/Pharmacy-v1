package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.enums.JobKeyEnum;
import com.pharmacy_backend.order_service.config.VoucherActivationJob;
import com.pharmacy_backend.order_service.config.VoucherExpirationJob;
import com.pharmacy_backend.order_service.service.QuartzService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuartzServiceImpl implements QuartzService {
    private final Scheduler scheduler;

    @Override
    public void scheduleJob(Long voucherId, JobKeyEnum key, LocalDateTime time) {
        try {
            String jobIdentity = key.name() + "_" + voucherId;
            String triggerIdentity = key.name() + "_trigger_" + voucherId;

            Class<? extends Job> jobClass = (key == JobKeyEnum.VOUCHER_ACTIVE)
                    ? VoucherActivationJob.class
                    : VoucherExpirationJob.class;

            JobDetail jobDetail = JobBuilder.newJob(jobClass)
                    .withIdentity(jobIdentity, "voucher-group")
                    .usingJobData("voucherId", String.valueOf(voucherId))
                    .usingJobData("jobType", key.name())
                    .storeDurably()
                    .build();

            Date startAt = Date.from(time.atZone(ZoneId.systemDefault()).toInstant());

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerIdentity, "voucher-group")
                    .startAt(startAt)
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule()
                            .withMisfireHandlingInstructionFireNow())
                    .build();

            if (scheduler.checkExists(jobDetail.getKey())) {
                scheduler.deleteJob(jobDetail.getKey());
            }

            scheduler.scheduleJob(jobDetail, trigger);

            log.info("Quartz đã lên lịch [{}] cho ID {} vào lúc {}", key, voucherId, time);

        } catch (SchedulerException e) {
            throw new RuntimeException("Lỗi lên lịch Quartz cho " + key, e);
        }
    }

    @Override
    public void removeJob(Long voucherId) {
        try {
            JobKey startKey = JobKey.jobKey(JobKeyEnum.VOUCHER_ACTIVE.getKey() + "_" + voucherId,
                    "promotion-group");
            JobKey endKey = JobKey.jobKey(JobKeyEnum.VOUCHER_EXPIRE.getKey() + "_" + voucherId,
                    "promotion-group");

            boolean deletedStart = scheduler.deleteJob(startKey);

            boolean deletedEnd = scheduler.deleteJob(endKey);

            log.info("Đã dọn dẹp lịch Quartz cho Voucher {}. Start deleted: {}, End deleted: {}",
                    voucherId, deletedStart, deletedEnd);

        } catch (SchedulerException e) {
            log.error("Lỗi khi xóa lịch Quartz cho Promo {}", voucherId, e);
        }
    }
}
