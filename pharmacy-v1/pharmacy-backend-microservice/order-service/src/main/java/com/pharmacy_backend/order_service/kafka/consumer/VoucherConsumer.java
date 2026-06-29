package com.pharmacy_backend.order_service.kafka.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.enums.EventTypeEnum;
import com.pharmacy_backend.common.kafka.event.UserEvent;
import com.pharmacy_backend.common.kafka.event.VoucherClaimedEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.order_service.entity.UserVoucher;
import com.pharmacy_backend.order_service.entity.Voucher;
import com.pharmacy_backend.order_service.repository.UserVoucherRepository;
import com.pharmacy_backend.order_service.repository.VoucherRepository;
import com.pharmacy_backend.order_service.service.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
@Slf4j
@Transactional
public class VoucherConsumer {
    private final ObjectMapper objectMapper;
    private final UserVoucherRepository userVoucherRepository;
    private final VoucherRepository voucherRepository;

    @KafkaListener(topics = "${spring.kafka.consumer.topic.voucher-topic}",
            groupId = "${spring.kafka.consumer.group-id}",
            concurrency = "${spring.kafka.consumer.concurrency}" )
    public void consumeUserCreatedEvent(String message, Acknowledgment acknowledgment) {
        try {
            Event<?> event = objectMapper.readValue(message, new TypeReference<>() {});
            if(event.getEventType().equalsIgnoreCase(EventTypeEnum.VOUCHER_CLAIMED.getName())) {
                VoucherClaimedEvent voucherClaimedEvent = objectMapper.convertValue(event.getData(), VoucherClaimedEvent.class);
                Voucher voucher = voucherRepository.findById(voucherClaimedEvent.getVoucherId())
                        .orElseThrow();
                voucher.setUsageLimit(voucher.getUsageLimit() - 1);
                voucherRepository.save(voucher);

                UserVoucher userVoucher = UserVoucher.builder()
                        .userId(voucherClaimedEvent.getUserId())
                        .voucherId(voucherClaimedEvent.getVoucherId())
                        .isUsed(false)
                        .quantity(1)
                        .build();
                userVoucherRepository.save(userVoucher);

                log.info("Received VoucherClaimedEvent: {}", voucherClaimedEvent);
            }
            acknowledgment.acknowledge();
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }
}
