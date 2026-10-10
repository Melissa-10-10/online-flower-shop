package com.flowershop.controller;

import com.flowershop.entity.Delivery;
import com.flowershop.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) { this.service = service; }

    @GetMapping
    public List<Delivery> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Delivery getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Delivery create(@Valid @RequestBody Delivery delivery) { return service.save(delivery); }

    @PatchMapping("/{id}/status")
    public Delivery updateStatus(@PathVariable Long id, @RequestParam String status) {
        return service.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
