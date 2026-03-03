package com.pharmacy_backend.product_service.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.utils.VectorUtils;
import com.pharmacy_backend.product_service.dto.request.AgentMessageRequest;
import com.pharmacy_backend.product_service.dto.response.AgentResponse;
import com.pharmacy_backend.product_service.dto.response.ProductResponse;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.mapper.ProductMapper;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import com.pharmacy_backend.product_service.service.AgentService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentServiceImpl implements AgentService {
    private final GeminiService geminiService;
    private final ProductMapper productMapper;
    private final ProductRepository productRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public ApiResponse<AgentResponse> generateResponse(AgentMessageRequest request) {
        String userMsg = request.getMessage();
        log.info("User message: {}", userMsg);

        List<Double> userVector = geminiService.getEmbedding(userMsg);
        log.info("User vector size: {}, first 3 values: {}",
                userVector.size(),
                userVector.size() >= 3 ? userVector.subList(0, 3) : userVector);

        List<Product> allProducts = productRepository.findAllLimit500();
        log.info("Total products fetched: {}", allProducts.size());

        List<Product> matchedProducts;

        matchedProducts = allProducts.stream()
                .map(p -> {
                    List<Double> productVector = parseEmbedding(p.getEmbedding());
                    double similarity = VectorUtils.cosineSimilarity(userVector, productVector);
                    log.debug("Product: {} | Similarity: {}", p.getTitle(), similarity);
                    return new ProductDistance(p, similarity);
                })
                .filter(wrapper -> wrapper.getDistance() > 0.0) // Chỉ lấy các sản phẩm có độ tương đồng > 0
                .sorted(Comparator.comparingDouble(ProductDistance::getDistance).reversed()) // Sắp xếp giảm dần theo similarity
                .limit(3)
                .peek(pd -> log.info("Matched product: {} | Similarity: {}", pd.getProduct().getTitle(), pd.getDistance()))
                .map(ProductDistance::getProduct)
                .toList();

        log.info("Total matched products: {}", matchedProducts.size());


        StringBuilder inventoryInfo = buildPrompt(matchedProducts);

        String systemInstructionText =
                "Bạn là Dược sĩ ảo chuyên nghiệp cho nhà thuốc của tôi, nhà thuốc này tên là Pharmacy " +
                        "Tư vấn sức khỏe, hướng dẫn dùng thuốc dựa trên thông tin được cung cấp. " +
                        "Nếu có triệu chứng nghiêm trọng, hãy khuyên người dùng đến gặp bác sĩ ngay lập tức " +
                        "Trả lời ngắn gọn, xúc tích từ 3 đến 4 câu. " +
                        "Không đề cập các sản phẩm không liên quan. " +
                        "Ngôn ngữ trả lời: Tiếng Việt. " +
                        "Tin nhắn từ người dùng: " + userMsg + " và đây là thông tin thuốc tôi cung cấp: " +
                        inventoryInfo;

        String aiMessage = geminiService.generateText(systemInstructionText);

        List<ProductResponse> productResponses = matchedProducts.stream()
                .map(productMapper::toProductResponse).toList();
        AgentResponse agentResponse = new AgentResponse(aiMessage, productResponses);
        return ApiResponse.buildOkResponse(agentResponse, "Phản hồi thành công");
    }

    private static StringBuilder buildPrompt(List<Product> products) {
        StringBuilder inventoryInfo = new StringBuilder();
        if (!products.isEmpty()) {
            inventoryInfo.append("\n[DỮ LIỆU KHO HÀNG THỰC TẾ]:\n");
            for (Product p : products) {
                inventoryInfo.append(String.format("- Tên: %s (%s) | Hoạt chất: %s | Giá: %s đ | Tồn kho: %d | Chỉ định: %s\n",
                        p.getTitle(), p.getDosageForm(), p.getActiveIngredient(),
                        p.getPriceNew(), p.getQuantity(), p.getIndication()));
            }
            inventoryInfo.append("Hãy ưu tiên tư vấn các sản phẩm trên nếu phù hợp triệu chứng.\n");
        }
        return inventoryInfo;
    }

    // Wrapper class
    @Data
    @AllArgsConstructor
    static class ProductDistance {
        Product product;
        Double distance;
    }

    private List<Double> parseEmbedding(String json) {
        try {
            if (json == null || json.isEmpty()) return Collections.emptyList();
            return objectMapper.readValue(json, new TypeReference<>() {
            });
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
