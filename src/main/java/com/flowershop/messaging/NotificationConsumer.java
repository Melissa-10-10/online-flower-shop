package com.flowershop.messaging;

import com.flowershop.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final JavaMailSender mailSender;

    @RabbitListener(queues = RabbitMQConfig.ORDER_PLACED_QUEUE)
    public void handleOrderPlaced(OrderEventPublisher.OrderEvent event) {
        log.info("Order placed event received for order #{}", event.getOrderId());
        sendEmail(
            event.getCustomerEmail(),
            "Order Confirmed - #" + event.getOrderId(),
            "Dear " + event.getCustomerName() + ",\n\n" +
            "Your order #" + event.getOrderId() + " has been placed successfully!\n" +
            "Total: $" + event.getTotalAmount() + "\n\n" +
            "Thank you for shopping with Bloom & Blossom!"
        );
    }

    @RabbitListener(queues = RabbitMQConfig.ORDER_STATUS_QUEUE)
    public void handleOrderStatusUpdate(OrderEventPublisher.OrderEvent event) {
        log.info("Order status updated: #{} -> {}", event.getOrderId(), event.getStatus());
        sendEmail(
            event.getCustomerEmail(),
            "Order Update - #" + event.getOrderId(),
            "Dear " + event.getCustomerName() + ",\n\n" +
            "Your order #" + event.getOrderId() + " status has been updated to: " + event.getStatus() + "\n\n" +
            "Bloom & Blossom Team"
        );
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
