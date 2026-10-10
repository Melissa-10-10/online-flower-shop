package com.flowershop.controller;

import com.flowershop.entity.Customer;
import com.flowershop.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerService service;

    public CustomerController(CustomerService service) { this.service = service; }

    @GetMapping
    public List<Customer> getAll() { return service.findAll(); }

    @GetMapping("/{id}")
    public Customer getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Customer create(@Valid @RequestBody Customer customer) { return service.save(customer); }

    @PutMapping("/{id}")
    public Customer update(@PathVariable Long id, @Valid @RequestBody Customer customer) {
        return service.update(id, customer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
