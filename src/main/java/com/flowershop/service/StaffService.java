package com.flowershop.service;

import com.flowershop.entity.Staff;
import com.flowershop.repository.StaffRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class StaffService {

    private final StaffRepository repo;

    public StaffService(StaffRepository repo) { this.repo = repo; }

    public List<Staff> findAll() { return repo.findAll(); }

    public List<Staff> findActive() { return repo.findByActiveTrue(); }

    public Staff findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Staff not found: " + id));
    }

    public Staff save(Staff staff) { return repo.save(staff); }

    public Staff update(Long id, Staff updated) {
        Staff existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setPhone(updated.getPhone());
        existing.setPosition(updated.getPosition());
        existing.setActive(updated.isActive());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
