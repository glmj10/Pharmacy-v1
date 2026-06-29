package com.pharmacy_backend.order_service.config;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.enums.VoucherStatusEnum;
import com.pharmacy_backend.order_service.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoucherExpirationJob extends QuartzJobBean {
    private final VoucherService voucherService;
    private final StringRedisTemplate redisTemplate;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        String voucherIdStr = context.getJobDetail().getJobDataMap().getString("voucherId");

        if (voucherIdStr != null) {
            Long voucherId = Long.parseLong(voucherIdStr);

            String stockKey = String.format("%s:%s:%d",
                    RedisKeyTypeEnum.VOUCHER.getKey(),
                    RedisKeyTypeEnum.STOCK.getKey(),
                    voucherId);

            Boolean deleted = redisTemplate.delete(stockKey);

            if (deleted) {
                log.info("Đã xóa Stock Key cho Voucher ID: {} trên Redis", voucherId);
            }

            voucherService.changeVoucherStatus(voucherId, VoucherStatusEnum.EXPIRED.name());

            log.info("Voucher ID: {} đã chuyển sang trạng thái EXPIRED", voucherId);
        } else {
            log.error("Không tìm thấy voucherId trong JobDataMap để thực hiện đóng Voucher");
        }
    }
}