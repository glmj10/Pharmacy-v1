package com.pharmacy_backend.order_service.config;

import com.pharmacy_backend.common.enums.RedisKeyTypeEnum;
import com.pharmacy_backend.common.enums.VoucherStatusEnum;
import com.pharmacy_backend.order_service.entity.Voucher;
import com.pharmacy_backend.order_service.repository.VoucherRepository;
import com.pharmacy_backend.order_service.service.VoucherService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.quartz.QuartzJobBean;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VoucherActivationJob extends QuartzJobBean {
    private final VoucherService voucherService;

    private final VoucherRepository voucherRepository;
    private final StringRedisTemplate redisTemplate;

    @Override
    protected void executeInternal(JobExecutionContext context) {
        String voucherIdStr = context.getJobDetail().getJobDataMap().getString( "voucherId");
        if(voucherIdStr != null) {
            Long voucherId = Long.parseLong(voucherIdStr);
            Voucher voucher = voucherRepository.findById(voucherId).orElseThrow();

            redisTemplate.opsForValue().set(
                    String.format("%s:%s:%d",
                            RedisKeyTypeEnum.VOUCHER.getKey(), RedisKeyTypeEnum.STOCK.getKey(), voucherId),
                    String.valueOf(voucher.getUsageLimit())
            );

            voucherService.changeVoucherStatus(voucherId, VoucherStatusEnum.ACTIVE.name());
        } else {
            log.error("Không tìm thấy voucherId trong JobDataMap");
        }
    }
}
