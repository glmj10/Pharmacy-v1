package com.pharmacy_backend.common.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ReserveResponse {
    boolean success;
    List<ProductItemError> errors;
    List<ProductCheckResponse> productCheckResponses;

}
