package com.flowershop.service;

import com.flowershop.document.ActivityLog;
import com.flowershop.dto.OrderDto;
import com.flowershop.entity.*;
import com.flowershop.messaging.OrderEventPublisher;
import com.flowershop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final UserRepository userRepo;
    private final ActivityLogRepository logRepo;
    private final OrderEventPublisher eventPublisher;

    @Transactional
    public OrderDto.Response placeOrder(OrderDto.CreateRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByUsername(username).orElseThrow();
        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow();

        Order order = Order.builder()
            .customer(customer)
            .deliveryAddress(request.getDeliveryAddress())
            .notes(request.getNotes())
            .build();

        List<OrderItem> items = request.getItems().stream().map(itemReq -> {
            Product product = productRepo.findById(itemReq.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            if (product.getStockQuantity() < itemReq.getQuantity())
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepo.save(product);
            return OrderItem.builder()
                .order(order)
                .product(product)
                .quantity(itemReq.getQuantity())
                .unitPrice(product.getPrice())
                .build();
        }).collect(Collectors.toList());

        order.setOrderItems(items);
        BigDecimal total = items.stream().map(OrderItem::getSubtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setTotalAmount(total);
        Order saved = orderRepo.save(order);

        // Publish RabbitMQ event
        eventPublisher.publishOrderPlaced(new OrderEventPublisher.OrderEvent(
            saved.getId(), user.getEmail(), customer.getFullName(),
            saved.getStatus().name(), total.toString()
        ));

        // Log to MongoDB
        logRepo.save(ActivityLog.builder()
            .action("ORDER_PLACED").performedBy(username)
            .entityType("Order").entityId(saved.getId().toString())
            .details("Order placed for $" + total).build());

        return toResponse(saved);
    }

    public Page<OrderDto.Response> getMyOrders(int page, int size) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepo.findByUsername(username).orElseThrow();
        Customer customer = customerRepo.findByUserId(user.getId()).orElseThrow();
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepo.findByCustomerId(customer.getId(), pageable).map(this::toResponse);
    }

    public Page<OrderDto.Response> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("orderDate").descending());
        return orderRepo.findAll(pageable).map(this::toResponse);
    }

    @Transactional
    public OrderDto.Response updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.Status.valueOf(status));
        Order saved = orderRepo.save(order);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        eventPublisher.publishOrderStatusUpdated(new OrderEventPublisher.OrderEvent(
            saved.getId(), saved.getCustomer().getUser().getEmail(),
            saved.getCustomer().getFullName(), status, saved.getTotalAmount().toString()
        ));
        logRepo.save(ActivityLog.builder()
            .action("ORDER_STATUS_UPDATED").performedBy(username)
            .entityType("Order").entityId(id.toString())
            .details("Status changed to " + status).build());
        return toResponse(saved);
    }

    private OrderDto.Response toResponse(Order order) {
        List<OrderDto.Response.ItemResponse> items = order.getOrderItems().stream()
            .map(i -> new OrderDto.Response.ItemResponse(
                i.getProduct().getId(), i.getProduct().getName(),
                i.getQuantity(), i.getUnitPrice(), i.getSubtotal()))
            .collect(Collectors.toList());
        return new OrderDto.Response(
            order.getId(), order.getCustomer().getFullName(),
            order.getStatus().name(), order.getTotalAmount(),
            order.getDeliveryAddress(), order.getOrderDate(), items);
    }
}
