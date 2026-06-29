package com.pharmacy_backend.product_service.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.genai.Client;
import com.google.genai.types.ContentEmbedding;
import com.google.genai.types.EmbedContentResponse;
import com.google.genai.types.GenerateContentResponse;
import com.pharmacy_backend.common.dto.response.ApiResponse;
import com.pharmacy_backend.common.enums.ErrorCode;
import com.pharmacy_backend.common.exceptions.CustomException;
import com.pharmacy_backend.common.utils.VectorUtils;
import com.pharmacy_backend.product_service.entity.Product;
import com.pharmacy_backend.product_service.repository.ProductJpaRepository;
import com.pharmacy_backend.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final Client client;
    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper;
    private final ProductJpaRepository productJpaRepository;

    @Value("${genai.embedding.model:text-embedding-004}")
    String embeddingModel;
    @Value("${genai.generation.model:gemini-2.5-flash}")
    String generationModel;

    public List<Double> getEmbedding(String text) {
        try {
            EmbedContentResponse response = client.models.embedContent(
                    embeddingModel,
                    text,
                    null
            );

            if (response.embeddings().isPresent()) {
                ContentEmbedding firstEmbedding = response.embeddings().get().get(0);

                List<Float> floatValues = firstEmbedding.values().orElse(new ArrayList<>());

                List<Double> vector = new ArrayList<>();
                for (Float f : floatValues) {
                    vector.add((double) f);
                }
                return vector;
            }

            return new ArrayList<>();
        } catch (Exception e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public String generateText(String prompt) {
        try {
            GenerateContentResponse response = client.models.generateContent(
                    generationModel,
                    prompt,
                    null
            );
            return response.text();
        } catch (Exception e) {
            return "Lỗi AI: " + e.getMessage();
        }
    }

    public ApiResponse<String> syncVectors() {
        List<Product> products = productRepository.findAllLimit500();
        int cnt = 0;

        for (Product product : products) {
            List<Double> embedding = getEmbedding(product.getTitle() + " " + product.getIndication());
            if (!embedding.isEmpty()) {
                    String text = String.format("%s %s %s",
                            product.getTitle(), product.getActiveIngredient(), product.getIndication());

                    List<Double> vector = getEmbedding(text);

                    try {
                        String vectorStr = VectorUtils.vectorToString(vector);
                        productJpaRepository.updateEmbedding(product.getId(), vectorStr);
                        cnt++;

//                        Thread.sleep(4000);
                    } catch (Exception e) {
                        throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi đồng bộ embedding: " + e.getMessage());
                    }
                }
        }

        return ApiResponse.buildOkResponse(null, "Đồng bộ thành công " + cnt + " sản phẩm");
    }
}
