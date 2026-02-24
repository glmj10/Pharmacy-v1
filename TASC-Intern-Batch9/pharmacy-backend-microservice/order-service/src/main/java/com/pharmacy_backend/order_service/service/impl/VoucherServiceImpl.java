package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.kafka.event.VoucherClaimedEvent;
import com.pharmacy_backend.common.kafka.event.base.Event;
import com.pharmacy_backend.common.security.SecurityUtils;
import com.pharmacy_backend.common.service.RedisService;
import com.pharmacy_backend.order_service.dto.projection.VoucherStatusInfoProjection;
import com.pharmacy_backend.order_service.dto.request.UserVoucherRequest;
import com.pharmacy_backend.order_service.dto.request.VoucherFilterRequest;
import com.pharmacy_backend.order_service.dto.request.VoucherRequest;
import com.pharmacy_backend.order_service.dto.response.VoucherResponse;
import com.pharmacy_backend.order_service.entity.UserVoucher;
import com.pharmacy_backend.order_service.entity.Voucher;
import com.pharmacy_backend.order_service.mapper.VoucherMapper;
import com.pharmacy_backend.order_service.repository.UserVoucherRepository;
import com.pharmacy_backend.order_service.repository.VoucherRepository;
import com.pharmacy_backend.order_service.repository.VoucherUsageRepository;
import com.pharmacy_backend.order_service.service.OutboxService;
import com.pharmacy_backend.order_service.service.QuartzService;
import com.pharmacy_backend.order_service.service.VoucherService;
import com.pharmacy_backend.order_service.specification.VoucherSpecification;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    final VoucherRepository voucherRepository;
    final VoucherUsageRepository voucherUsageRepository;
    final UserVoucherRepository userVoucherRepository;
    final VoucherMapper voucherMapper;
    final QuartzService quartzService;
    final RedisService redisService;
    final StringRedisTemplate redisTemplate;
    final DefaultRedisScript<Long> claimLuaScript;
    final OutboxService outboxService;

    @Value("${spring.application.name}")
    String appName;

    @Override
    public ApiResponse<PageResponse<List<VoucherResponse>>> getVouchers(
            int pageIndex, int pageSize, VoucherFilterRequest request) {
        if(pageIndex < 0) {
            pageIndex = 1;
        }
        if(pageSize <= 0) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Voucher> voucherPage;
        try{
            // Build specification safely depending on provided filters
            Specification<Voucher> specification = null;
            if (request != null) {
                boolean hasType = request.getType() != null;
                boolean hasStatus = request.getStatus() != null;

                if (hasType && hasStatus) {
                    specification = VoucherSpecification.hasType(request.getType())
                            .and(VoucherSpecification.hasStatus(request.getStatus()));
                } else if (hasType) {
                    specification = VoucherSpecification.hasType(request.getType());
                } else if (hasStatus) {
                    specification = VoucherSpecification.hasStatus(request.getStatus());
                }
            }

            voucherPage = voucherRepository.findAll(specification, pageable);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }

        List<VoucherResponse> voucherResponses = buildVoucherResponse(voucherPage.getContent());

        PageResponse<List<VoucherResponse>> pageResponse = PageResponse.<List<VoucherResponse>>builder()
                .currentPage(pageIndex)
                .totalPages(voucherPage.getTotalPages())
                .totalElements(voucherPage.getTotalElements())
                .content(voucherResponses)
                .hasNext(voucherPage.hasNext())
                .hasPrevious(voucherPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách voucher thành công");
    }

    @Override
    public ApiResponse<VoucherResponse> getVoucherById(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));
        VoucherResponse response = voucherMapper.toVoucherResponse(voucher);
        return ApiResponse.buildOkResponse(response, "Lấy thông tin voucher thành công");
    }

    @Override
    public ApiResponse<Void> createVoucher(VoucherRequest request) {
        Voucher voucher = voucherMapper.toVoucher(request);

        try {
            voucher.setType(VoucherTypeEnum.valueOf(request.getType()));
//            voucher.setStatus(VoucherStatusEnum.valueOf(request.getStatus()));

        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }

        voucherRepository.save(voucher);

        if(voucher.getStatus() == VoucherStatusEnum.INACTIVE && voucher.getStartDate() != null
            && voucher.getStartDate().isAfter(LocalDateTime.now())) {
            quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_ACTIVE, voucher.getStartDate());
        }

        if(voucher.getEndDate() != null && voucher.getEndDate().isAfter(LocalDateTime.now())) {
            quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_EXPIRE, voucher.getEndDate());
        }

        return ApiResponse.buildCreatedResponse(null, "Tạo voucher thành công");
    }

    @Override
    public ApiResponse<Void> updateVoucher(Long id, VoucherRequest request) {
        Voucher existVoucher = voucherRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));

        if(existVoucher.getStatus() == VoucherStatusEnum.ACTIVE &&
        !(existVoucher.getType() == VoucherTypeEnum.valueOf(request.getType()))) {
            throw new CustomException(ErrorCode.CANNOT_UPDATE_VOUCHER_TYPE, HttpStatus.BAD_REQUEST);
        }

        Voucher voucher = voucherMapper.toVoucherUpdateFromRequest(request, existVoucher);

        try {
            voucher.setType(VoucherTypeEnum.valueOf(request.getType()));
            if(request.getStatus() != null) {
                voucher.setStatus(VoucherStatusEnum.valueOf(request.getStatus()));
            }

        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }

        voucherRepository.save(voucher);

        if(VoucherStatusEnum.valueOf(request.getStatus()) == VoucherStatusEnum.CANCELLED
                || VoucherStatusEnum.valueOf(request.getStatus()) == VoucherStatusEnum.EXPIRED) {
            quartzService.removeJob(voucher.getId());
        }

        if(voucher.getStatus() == VoucherStatusEnum.INACTIVE) {
            quartzService.removeJob(voucher.getId());
            if(voucher.getStartDate() != null
                    && voucher.getStartDate().isAfter(LocalDateTime.now())) {
                quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_ACTIVE, voucher.getStartDate());
            }

            if(voucher.getEndDate() != null
                    && voucher.getEndDate().isAfter(LocalDateTime.now())) {
                quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_EXPIRE, voucher.getEndDate());
            }
        }


        return ApiResponse.buildOkResponse(null, "Cập nhật voucher thành công");
    }

    @Override
    public ApiResponse<Void> deleteVoucher(Long id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));
        voucherRepository.delete(voucher);
        redisService.deleteCacheKey(String.format("%s:%s:%d",
                RedisKeyTypeEnum.VOUCHER.getKey(), RedisKeyTypeEnum.STOCK.getKey(), voucher.getId()));

        quartzService.removeJob(voucher.getId());
        return ApiResponse.buildOkResponse(null, "Xóa voucher thành công");
    }

    @Override
    public ApiResponse<Void> claimVoucher(UserVoucherRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        Long voucherId = request.getVoucherId();

        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));

        if(voucher.getType() == VoucherTypeEnum.PUBLIC) {
            throw new CustomException(ErrorCode.VOUCHER_CANNOT_CLAIM, HttpStatus.BAD_REQUEST);
        }

        String stockKey = String.format("%s:%s:%d",
                RedisKeyTypeEnum.VOUCHER.getKey(), RedisKeyTypeEnum.STOCK.getKey(), voucherId);

        String claimedKey = String.format("%s:%d",
                RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getKey(), userId);

        String rateLimitKey = String.format("USER:%s:%d:%d",
                RedisKeyTypeEnum.LIMIT.getKey(), userId, voucherId);

        Long result = redisTemplate.execute(claimLuaScript,
                Arrays.asList(stockKey, claimedKey, rateLimitKey),
                String.valueOf(voucherId));

        if (result < 0) {
            handleLuaError(result);
        }

        VoucherClaimedEvent event = new VoucherClaimedEvent(userId, voucherId);
        Event<VoucherClaimedEvent> wrapperEvent = Event.<VoucherClaimedEvent>builder()
                .eventType(EventTypeEnum.VOUCHER_CLAIMED.getName())
                .key(String.format("%s:%d", PartitionKeyEnum.VOUCHER.getName(), voucherId))
                .source(appName)
                .data(event)
                .build();

        outboxService.handleSaveEvent(wrapperEvent, TopicEnum.VOUCHER_TOPIC);

        return ApiResponse.buildCreatedResponse(null, "Nhận voucher thành công! Kiểm tra trong ví của bạn nhé.");
    }

    private void handleLuaError(Long result) {
        if (result == -1) throw new CustomException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED, HttpStatus.BAD_REQUEST);
        if (result == -2) throw new CustomException(ErrorCode.VOUCHER_ALREADY_CLAIMED, HttpStatus.BAD_REQUEST);
        if (result == -4) throw new CustomException(ErrorCode.TOO_MANY_REQUESTS, HttpStatus.TOO_MANY_REQUESTS);
    }

    @Override
    public void changeVoucherStatus(Long voucherId, String status) {
        Voucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));

        try {
            if(status.equals(VoucherStatusEnum.CANCELLED.name())
                    || status.equalsIgnoreCase(VoucherStatusEnum.EXPIRED.name())) {
                if (voucher.getStatus() == VoucherStatusEnum.INACTIVE) {
                    quartzService.removeJob(voucher.getId());
                }
            }

            if(status.equals(VoucherStatusEnum.INACTIVE.name())) {
                quartzService.removeJob(voucher.getId());
                if(voucher.getStartDate() != null
                        && voucher.getStartDate().isAfter(LocalDateTime.now())) {
                    quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_ACTIVE, voucher.getStartDate());
                }

                if(voucher.getEndDate() != null
                        && voucher.getEndDate().isAfter(LocalDateTime.now())) {
                    quartzService.scheduleJob(voucher.getId(), JobKeyEnum.VOUCHER_EXPIRE, voucher.getEndDate());
                }
            }
        } catch (Exception e) {
            throw new CustomException(
                    ErrorCode.INVALID_PROMOTION_STATUS, HttpStatus.BAD_REQUEST);
        }

        voucher.setStatus(VoucherStatusEnum.valueOf(status));
        voucherRepository.save(voucher);
    }

    @Override
    public ApiResponse<PageResponse<List<VoucherResponse>>> getUserVouchers(int pageIndex, int pageSize, String type) {
        if(pageIndex < 0) {
            pageIndex = 1;
        }

        if(pageSize <= 0) {
            pageSize = 10;
        }
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<Voucher> voucherPage;
        try{
            voucherPage = voucherRepository.findUserVouchersByType(
                    SecurityUtils.getCurrentUserId(),
                    (type != null) ? VoucherTypeEnum.valueOf(type) : null,
                    pageable);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, HttpStatus.INTERNAL_SERVER_ERROR,
                    e.getMessage());
        }

        List<VoucherResponse> voucherResponses = buildVoucherResponse(voucherPage.getContent());

        PageResponse<List<VoucherResponse>> pageResponse = PageResponse.<List<VoucherResponse>>builder()
                .currentPage(pageIndex)
                .totalPages(voucherPage.getTotalPages())
                .totalElements(voucherPage.getTotalElements())
                .content(voucherResponses)
                .hasNext(voucherPage.hasNext())
                .hasPrevious(voucherPage.hasPrevious())
                .build();
        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách voucher của người dùng thành công");
    }


    private List<VoucherResponse> buildVoucherResponse(List<Voucher> vouchers) {
        Long userId = SecurityUtils.getCurrentUserId();
        String claimedKey = String.format("%s:%d", RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getKey(), userId);

        Set<String> claimedVoucherIdsStr = redisService.getSetMembers(claimedKey);
        Set<Long> claimIds;

        if (claimedVoucherIdsStr == null || claimedVoucherIdsStr.isEmpty()) {
            List<Long> ids = vouchers.stream().map(Voucher::getId).toList();
            claimIds = userVoucherRepository.findClaimedVoucherIds(userId, ids);
            if (!claimIds.isEmpty()) {
                String[] arr = claimIds.stream().map(String::valueOf).toArray(String[]::new);
                redisService.addValueToSet(claimedKey, arr, RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getDuration());
            }
        } else {
            claimIds = claimedVoucherIdsStr.stream().map(Long::valueOf).collect(Collectors.toSet());
        }

        Map<Long, Boolean> finalUsedMaps = userVoucherRepository.findUsedStatus(userId, claimIds).stream()
                .collect(Collectors.toMap(VoucherStatusInfoProjection::getVoucherId,
                        p -> p.getUsed() != null && p.getUsed(), (e, r) -> e));

        return vouchers.stream().map(v -> {
            VoucherResponse res = voucherMapper.toVoucherResponse(v);
            res.setClaimed(claimIds.contains(v.getId()));
            res.setUsed(finalUsedMaps.getOrDefault(v.getId(), false));
            return res;
        }).toList();
    }
//    private List<VoucherResponse> buildVoucherResponse(List<Voucher> vouchers) {
//        Set<String> claimedVoucherIdsStr = redisService.getSetMembers(
//                RedisKeyTypeEnum.USER_CLAIMED_VOUCHER + ":" + SecurityUtils.getCurrentUserId()
//        );
//
//        Set<Long> claimIds;
//        if(claimedVoucherIdsStr.isEmpty()) {
//            List<Long> ids = vouchers.stream().map(Voucher::getId).toList();
//            claimIds = userVoucherRepository.findClaimedVoucherIds(SecurityUtils.getCurrentUserId(), ids);
//            if(!claimIds.isEmpty()) {
//                String[] arr = claimIds.stream().map(String::valueOf).toArray(String[]::new);
//                redisService.addValueToSet(
//                        RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.name() + ":" + SecurityUtils.getCurrentUserId(),
//                        arr, RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getDuration());
//            }
//        } else {
//            claimIds = claimedVoucherIdsStr.stream().map(Long::valueOf).collect(java.util.stream.Collectors.toSet());
//        }
//
//        Map<Long, Boolean> finalUsedMaps = userVoucherRepository.findUsedStatus(
//                SecurityUtils.getCurrentUserId(), claimIds).stream()
//                .filter(projection -> projection.getVoucherId() != null)
//                .collect(Collectors.toMap(
//                        VoucherStatusInfoProjection::getVoucherId,
////                        VoucherStatusInfoProjection::getUsed
//                        projection -> projection.getUsed() != null ? projection.getUsed() : false,
//                        (existing, replacement) -> existing
//                ));
//
//        return vouchers
//                .stream()
//                .map(voucher -> {
//                    VoucherResponse response = voucherMapper.toVoucherResponse(voucher);
//                    response.setClaimed(claimIds.contains(voucher.getId()));
//                    response.setUsed(finalUsedMaps.getOrDefault(voucher.getId(), false));
//                    return response;
//                })
//                .toList();
//    }
}
