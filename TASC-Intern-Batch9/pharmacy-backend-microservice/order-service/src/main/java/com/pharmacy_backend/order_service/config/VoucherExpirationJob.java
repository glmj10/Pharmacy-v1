package com.pharmacy_backend.order_service.config;

import com.pharmacy_backend.common.enums.VoucherStatusEnum;
import com.pharmacy_backend.order_service.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoucherExpirationJob extends QuartzJobBean {
    private final VoucherService voucherService;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        String voucherIdStr = context.getJobDetail().getJobDataMap().getString( "voucherId");
        if(voucherIdStr != null) {
            Long promotionId = Long.parseLong(voucherIdStr);
            voucherService.changeVoucherStatus(promotionId, VoucherStatusEnum.EXPIRED.name());
        } else {
            log.error("Không tìm thấy voucherId trong JobDataMap");
        }
    }
}
