package com.flowershop.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class CreateRequest {
        @NotBlank
        private String deliveryAddress;

        private String notes;

        @NotEmpty
        private List<ItemRequest> items;

        @Data
        public static class ItemRequest {
            @NotNull private Long productId;
            @NotNull @Min(1) private Integer quantity;
        }
    }

    @Data
    @lombok.AllArgsConstructor
    @lombok.NoArgsConstructor
    public static class Response {
        private Long id;
        private String customerName;
        private String status;
        private BigDecimal totalAmount;
        private String deliveryAddress;
        private LocalDateTime orderDate;
        private List<ItemResponse> items;

        @Data
        @lombok.AllArgsConstructor
        @lombok.NoArgsConstructor
        public static class ItemResponse {
            private Long productId;
            private String productName;
            private Integer quantity;
            private BigDecimal unitPrice;
            private BigDecimal subtotal;
        }
    }
}
