package com.flowershop.controller;

import com.flowershop.entity.Staff;
import com.flowershop.service.StaffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService service;

    public StaffController(StaffService service) { this.service = service; }

    @GetMapping
    public List<Staff> getAll() { return service.findAll(); }

    @GetMapping("/active")
    public List<Staff> getActive() { return service.findActive(); }

    @GetMapping("/{id}")
    public Staff getById(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Staff create(@Valid @RequestBody Staff staff) { return service.save(staff); }

    @PutMapping("/{id}")
    public Staff update(@PathVariable Long id, @Valid @RequestBody Staff staff) {
        return service.update(id, staff);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
