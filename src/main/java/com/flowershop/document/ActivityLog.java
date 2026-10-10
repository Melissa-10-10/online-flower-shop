package com.flowershop.document;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "activity_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    @Id
    private String id;

    private String action;       // ORDER_PLACED, USER_REGISTERED, PRODUCT_UPDATED
    private String performedBy;  // username
    private String entityType;   // Order, Product, User
    private String entityId;
    private String details;
    private String ipAddress;

    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
