package com.flowershop.service;

import com.flowershop.entity.Customer;
import com.flowershop.repository.CustomerRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository repo;

    public CustomerService(CustomerRepository repo) { this.repo = repo; }

    public List<Customer> findAll() { return repo.findAll(); }

    public Customer findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Customer not found: " + id));
    }

    public Customer save(Customer customer) { return repo.save(customer); }

    public Customer update(Long id, Customer updated) {
        Customer existing = findById(id);
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setPhone(updated.getPhone());
        existing.setAddress(updated.getAddress());
        existing.setCity(updated.getCity());
        return repo.save(existing);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
