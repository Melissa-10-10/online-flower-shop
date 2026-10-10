package com.flowershop.service;

import com.flowershop.entity.Delivery;
import com.flowershop.repository.DeliveryRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class DeliveryService {

    private final DeliveryRepository repo;

    public DeliveryService(DeliveryRepository repo) { this.repo = repo; }

    public List<Delivery> findAll() { return repo.findAll(); }

    public Delivery findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Delivery not found: " + id));
    }

    public Delivery save(Delivery delivery) { return repo.save(delivery); }

    public Delivery updateStatus(Long id, String status) {
        Delivery delivery = findById(id);
        delivery.setStatus(status);
        return repo.save(delivery);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
