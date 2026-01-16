package com.pharmacy_backend.order_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.*;
import com.pharmacy_backend.common.exceptions.CustomException;
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
import com.pharmacy_backend.order_service.service.QuartzService;
import com.pharmacy_backend.order_service.service.VoucherService;
import com.pharmacy_backend.order_service.specification.VoucherSpecification;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class VoucherServiceImpl implements VoucherService {
    VoucherRepository voucherRepository;
    VoucherUsageRepository voucherUsageRepository;
    UserVoucherRepository userVoucherRepository;
    VoucherMapper voucherMapper;
    QuartzService quartzService;
    RedisService redisService;


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
            Specification<Voucher> specification = VoucherSpecification.hasType(request.getType())
                    .and(VoucherSpecification.hasStatus(request.getType()));

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
        quartzService.removeJob(voucher.getId());
        return ApiResponse.buildOkResponse(null, "Xóa voucher thành công");
    }

    @Override
    public ApiResponse<Void> claimVoucher(UserVoucherRequest request) {
        Voucher voucher = voucherRepository.findById(request.getVoucherId())
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND, HttpStatus.NOT_FOUND));

        if(voucher.getType() == VoucherTypeEnum.PUBLIC) {
            throw new CustomException(ErrorCode.VOUCHER_CANNOT_CLAIM, HttpStatus.BAD_REQUEST);
        }

        if(voucher.getStatus() != VoucherStatusEnum.ACTIVE) {
            throw new CustomException(ErrorCode.VOUCHER_NOT_ACTIVE, HttpStatus.BAD_REQUEST);
        }

        if(voucher.getCollectedCount() > voucher.getUsageLimit()) {
            throw new CustomException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED, HttpStatus.BAD_REQUEST);
        }
        boolean alreadyClaimed = userVoucherRepository.existsByUserIdAndVoucherId(
                SecurityUtils.getCurrentUserId(), voucher.getId());

        if(alreadyClaimed) {
            throw new CustomException(ErrorCode.VOUCHER_ALREADY_CLAIMED, HttpStatus.BAD_REQUEST);
        }

        int rowCnt = voucherRepository.increaseCollectedCount(request.getVoucherId());

        if (rowCnt == 0) {
            throw new CustomException(ErrorCode.VOUCHER_USAGE_LIMIT_REACHED, HttpStatus.BAD_REQUEST);
        }

        UserVoucher userVoucher = UserVoucher.builder()
                .userId(SecurityUtils.getCurrentUserId())
                .voucherId(voucher.getId())
                .build();

        userVoucherRepository.save(userVoucher);
        String key = RedisKeyTypeEnum.USER_CLAIMED_VOUCHER + ":" + SecurityUtils.getCurrentUserId();
        redisService.addValueToSet(
                key, String.valueOf(voucher.getId()), RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getDuration()
        );

        return ApiResponse.buildCreatedResponse(null, "Nhận voucher thành công");
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
                .totalPages(pageSize)
                .totalElements(voucherPage.getTotalElements())
                .content(voucherResponses)
                .hasNext(voucherPage.hasNext())
                .hasPrevious(voucherPage.hasPrevious())
                .build();
        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách voucher của người dùng thành công");
    }

    private List<VoucherResponse> buildVoucherResponse(List<Voucher> vouchers) {
        Set<String> claimedVoucherIdsStr = redisService.getSetMembers(
                RedisKeyTypeEnum.USER_CLAIMED_VOUCHER + ":" + SecurityUtils.getCurrentUserId()
        );

        Set<Long> claimIds;
        if(claimedVoucherIdsStr.isEmpty()) {
            List<Long> ids = vouchers.stream().map(Voucher::getId).toList();
            claimIds = userVoucherRepository.findClaimedVoucherIds(SecurityUtils.getCurrentUserId(), ids);
            if(!claimIds.isEmpty()) {
                String[] arr = claimIds.stream().map(String::valueOf).toArray(String[]::new);
                redisService.addValueToSet(
                        RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.name() + ":" + SecurityUtils.getCurrentUserId(),
                        arr, RedisKeyTypeEnum.USER_CLAIMED_VOUCHER.getDuration());
            }
        } else {
            claimIds = claimedVoucherIdsStr.stream().map(Long::valueOf).collect(java.util.stream.Collectors.toSet());
        }

        Map<Long, Boolean> finalUsedMaps = userVoucherRepository.findUsedStatus(
                SecurityUtils.getCurrentUserId(), claimIds).stream()
                .filter(projection -> projection.getVoucherId() != null)
                .collect(Collectors.toMap(
                        VoucherStatusInfoProjection::getVoucherId,
//                        VoucherStatusInfoProjection::getUsed
                        projection -> projection.getUsed() != null ? projection.getUsed() : false,
                        (existing, replacement) -> existing
                ));

        return vouchers
                .stream()
                .map(voucher -> {
                    VoucherResponse response = voucherMapper.toVoucherResponse(voucher);
                    response.setClaimed(claimIds.contains(voucher.getId()));
                    response.setUsed(finalUsedMaps.getOrDefault(voucher.getId(), false));
                    return response;
                })
                .toList();
    }
}
