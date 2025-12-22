package com.pharmacy_backend.product_service.service.impl;

import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.dto.response.FileMetadataResponse;
import com.pharmacy_backend.common.dto.response.PageResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.enums.FileCategoryEnum;
import com.pharmacy_backend.common.enums.JobKeyEnum;
import com.pharmacy_backend.common.enums.PromotionEventStatusEnum;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.product_service.dto.request.PromotionEventRequest;
import com.pharmacy_backend.product_service.dto.response.PromotionEventResponse;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.entity.PromotionEvent;
import com.pharmacy_backend.product_service.entity.PromotionItem;
import com.pharmacy_backend.product_service.mapper.PromotionEventMapper;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.repository.PromotionEventRepository;
import com.pharmacy_backend.product_service.repository.PromotionItemRepository;
import com.pharmacy_backend.product_service.service.FileServiceClient;
import com.pharmacy_backend.product_service.service.PromotionEventService;
import com.pharmacy_backend.product_service.service.QuartzService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
@Transactional
public class PromotionEventServiceImpl implements PromotionEventService {

    private final PromotionEventRepository promotionEventRepository;
    private final PromotionEventMapper promotionEventMapper;
    private final FileServiceClient fileServiceClient;
    private final ProductRepository productRepository;
    private final PromotionItemRepository promotionItemRepository;
    private final QuartzService quartzService;
    private final ProductRedisService productRedisService;

    @Override
    public ApiResponse<List<PromotionEventResponse>> getCurrentEvent() {
        List<PromotionEvent> currentEvents = promotionEventRepository.findCurrentFlashSaleEvents();

        List<PromotionEventResponse> responses = currentEvents.stream()
                .map(promotionEventMapper::toResponse)
                .toList();
        return ApiResponse.buildOkResponse(responses, "Lấy danh sách sự kiện flash sale hiện tại thành công");
    }

    @Override
    public ApiResponse<PageResponse<List<PromotionEventResponse>>> getAllEvents(Integer pageIndex, Integer pageSize) {
        if(pageIndex == null || pageIndex < 1) {
            pageIndex = 1;
        }

        if(pageSize == null || pageSize < 1) {
            pageSize = 10;
        }

        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PromotionEvent> flashSaleEventPage = promotionEventRepository.findAll(pageable);

        List<PromotionEventResponse> promotionEventResponseList = flashSaleEventPage.getContent().stream()
                .map(promotionEventMapper::toResponse)
                .toList();

        PageResponse<List<PromotionEventResponse>> pageResponse = PageResponse.<List<PromotionEventResponse>>builder()
                .content(promotionEventResponseList)
                .currentPage(pageIndex)
                .totalElements(flashSaleEventPage.getTotalElements())
                .totalPages(flashSaleEventPage.getTotalPages())
                .hasNext(flashSaleEventPage.hasNext())
                .hasPrevious(flashSaleEventPage.hasPrevious())
                .build();

        return ApiResponse.buildOkResponse(pageResponse, "Lấy danh sách sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<PromotionEventResponse> getEventById(Long eventId) {
        PromotionEvent promotionEvent = promotionEventRepository.findById(eventId).orElseThrow(() ->
                new CustomException(ErrorCode.PROMOTION_EVENT_NOT_FOUND)
        );

        PromotionEventResponse response = promotionEventMapper.toResponse(promotionEvent);
        return ApiResponse.buildOkResponse(response, "Lấy thông tin sự kiện flash sale thành công");
    }

    @Override
    public ApiResponse<Void> createEvent(PromotionEventRequest request, MultipartFile thumbnail) {
        PromotionEvent promotionEvent = promotionEventMapper.toPromotionEvent(request);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            ApiResponse<FileMetadataResponse> uploadResponse = fileServiceClient.uploadFile(
                    thumbnail, FileCategoryEnum.PROMOTION.getSubDirectory()
            );
            if (uploadResponse.getStatus() != HttpStatus.SC_CREATED) {
                throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
            }
            String thumbnailUuid = uploadResponse.getData().getId().toString();
            String thumbnailUrl = uploadResponse.getData().getFileUrl();
            promotionEvent.setThumbnailUUID(thumbnailUuid);
            promotionEvent.setThumbnailUrl(thumbnailUrl);
        }

        promotionEventRepository.save(promotionEvent);
        if(promotionEvent.getStartTime() != null && promotionEvent.getStartTime().isAfter(java.time.LocalDateTime.now())) {
            quartzService.schedulePromotionTime(
                    promotionEvent.getId(),
                    JobKeyEnum.PROMOTION_START,
                    promotionEvent.getStartTime()
            );
        }

        if(promotionEvent.getEndTime() != null) {
            quartzService.schedulePromotionTime(
                    promotionEvent.getId(),
                    JobKeyEnum.PROMOTION_END,
                    promotionEvent.getEndTime()
            );
        }

        return ApiResponse.buildOkResponse(null, "Tạo sự kiện khuyến mãi thành công");
    }

    @Override
    public ApiResponse<Void> updateEvent(Long eventId, PromotionEventRequest request, MultipartFile thumbnail) {
        PromotionEvent existingEvent = promotionEventRepository.findById(eventId).orElseThrow(() ->
                new CustomException(ErrorCode.PROMOTION_EVENT_NOT_FOUND)
        );

        if(existingEvent.getStatus() == PromotionEventStatusEnum.ONGOING) {
            throw new CustomException(ErrorCode.CANNOT_UPDATE_ONGOING_PROMOTION);
        }

        PromotionEvent event = promotionEventMapper.toPromotionEventUpdateFromRequest(request, existingEvent);

        if (thumbnail != null && !thumbnail.isEmpty()) {
            fileServiceClient.deleteFile(existingEvent.getThumbnailUUID());
            ApiResponse<FileMetadataResponse> uploadResponse = fileServiceClient.uploadFile(thumbnail, "promotion-event-thumbnails");
            if (uploadResponse.getStatus() != HttpStatus.SC_OK) {
                throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
            }

            String thumbnailUuid = uploadResponse.getData().getId().toString();
            String thumbnailUrl = uploadResponse.getData().getFileUrl();
            event.setThumbnailUUID(thumbnailUuid);
            event.setThumbnailUrl(thumbnailUrl);
        }

        event.setStatus(PromotionEventStatusEnum.UPCOMING);
        promotionEventRepository.save(event);

        if(existingEvent.getStatus() == PromotionEventStatusEnum.UPCOMING) {
            quartzService.removeScheduledPromotionActivation(existingEvent.getId());
            if(event.getStartTime() != null && event.getStartTime().isAfter(java.time.LocalDateTime.now())) {
                quartzService.schedulePromotionTime(
                        event.getId(),
                        JobKeyEnum.PROMOTION_START,
                        event.getStartTime()
                );
            }

            if(existingEvent.getEndTime() != null) {
                quartzService.schedulePromotionTime(
                        existingEvent.getId(),
                        JobKeyEnum.PROMOTION_END,
                        existingEvent.getEndTime()
                );
            }
        }

        return ApiResponse.buildOkResponse(null, "Cập nhật sự kiện thành công");
    }

    @Override
    public ApiResponse<Void> deleteEvent(Long eventId) {
        PromotionEvent existingEvent = promotionEventRepository.findById(eventId)
                .orElseThrow(() -> new CustomException(ErrorCode.PROMOTION_EVENT_NOT_FOUND)
        );

        if(existingEvent.getStatus() == PromotionEventStatusEnum.ONGOING) {
            throw new CustomException(ErrorCode.CANNOT_DELETE_ONGOING_PROMOTION);
        } else if (existingEvent.getStatus() == PromotionEventStatusEnum.UPCOMING) {
            quartzService.removeScheduledPromotionActivation(existingEvent.getId());
        }

        fileServiceClient.deleteFile(existingEvent.getThumbnailUUID());
        promotionEventRepository.delete(existingEvent);

        return ApiResponse.buildOkResponse(null, "Xóa sự kiện thành công");
    }

    @Override
    public void activePromotion(Long promotionId) {
        PromotionEvent promotionEvent = promotionEventRepository.findById(promotionId)
                .orElse(null);

        if(promotionEvent == null || promotionEvent.getStatus() != PromotionEventStatusEnum.UPCOMING) {
            log.info("Không tìm thấy sự kiện, bắt đầu hủy sự kiện {}", promotionId);
            return;
        }

        List<Product> products = productRepository.findAllByPromotionId(promotionId);
        Map<Long, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getId, Function.identity()));
        List<PromotionItem> promotionItems = promotionItemRepository.findByPromotionEventId(promotionEvent.getId());

        promotionItems.forEach(promotionItem -> {
            Product product = productMap.get(promotionItem.getProductId());
            if (product != null) {
                product.setPriceOld(product.getPriceNew());
                product.setPriceNew(promotionItem.getSalePrice());
            }
        });

        promotionEvent.setStatus(PromotionEventStatusEnum.ONGOING);
        productRepository.updateAll(products);
        promotionEventRepository.save(promotionEvent);
        productRedisService.deleteCacheProductDetail(
                products.stream().map(Product::getSlug).toList()
        );
    }

    @Override
    public ApiResponse<Void> changePromotionStatus(Long promotionId, String status) {
        PromotionEvent promotionEvent = promotionEventRepository.findById(promotionId)
                .orElseThrow(() -> new CustomException(
                        ErrorCode.PROMOTION_EVENT_NOT_FOUND, org.springframework.http.HttpStatus.NOT_FOUND));

        try {
            if(status.equals(PromotionEventStatusEnum.CANCELLED.getName())
                    || status.equalsIgnoreCase(PromotionEventStatusEnum.ENDED.getName())) {
                if(promotionEvent.getStatus() == PromotionEventStatusEnum.ONGOING) {
                    List<Product> products = productRepository.findAllByPromotionId(promotionId);
                    Map<Long, Product> productMap = products.stream()
                            .collect(Collectors.toMap(Product::getId, Function.identity()));
                    List<PromotionItem> promotionItems = promotionItemRepository.findByPromotionEventId(
                            promotionEvent.getId());

                    promotionItems.forEach(promotionItem -> {
                        Product product = productMap.get(promotionItem.getProductId());
                        if (product != null) {
                            product.setPriceNew(product.getPriceOld());
                        }
                    });

                    productRepository.updateAll(products);
                    productRedisService.deleteCacheProductDetail(
                            products.stream().map(Product::getSlug).toList()
                    );
                } else if (promotionEvent.getStatus() == PromotionEventStatusEnum.UPCOMING) {
                    quartzService.removeScheduledPromotionActivation(promotionEvent.getId());
                }
            }
        } catch (Exception e) {
            throw new CustomException(
                    ErrorCode.INVALID_PROMOTION_STATUS, org.springframework.http.HttpStatus.BAD_REQUEST);
        }

        promotionEvent.setStatus(PromotionEventStatusEnum.valueOf(status));
        promotionEventRepository.save(promotionEvent);

        return ApiResponse.buildOkResponse(null, "Chuyển đổi sự kiện khuyến mãi thành công");
    }
}
