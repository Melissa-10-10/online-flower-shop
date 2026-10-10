package com.flowershop.messaging;

import com.flowershop.config.RabbitMQConfig;
import lombok.*;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishOrderPlaced(OrderEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.ORDER_PLACED_KEY, event);
    }

    public void publishOrderStatusUpdated(OrderEvent event) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.ORDER_EXCHANGE, RabbitMQConfig.ORDER_STATUS_KEY, event);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class OrderEvent {
        private Long orderId;
        private String customerEmail;
        private String customerName;
        private String status;
        private String totalAmount;
    }
}
