package com.flowershop.service;

import com.flowershop.entity.Product;
import com.flowershop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;

    @Cacheable(value = "products", key = "#page + '-' + #size + '-' + #category + '-' + #keyword")
    public Page<Product> getProducts(int page, int size, String category, String keyword) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (keyword != null && !keyword.isBlank())
            return repo.searchProducts(keyword, pageable);
        if (category != null && !category.isBlank())
            return repo.findByCategoryAndAvailableTrue(category, pageable);
        return repo.findByAvailableTrue(pageable);
    }

    @Cacheable(value = "product", key = "#id")
    public Product findById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product save(Product product) { return repo.save(product); }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product update(Long id, Product updated) {
        Product p = findById(id);
        p.setName(updated.getName());
        p.setCategory(updated.getCategory());
        p.setPrice(updated.getPrice());
        p.setStockQuantity(updated.getStockQuantity());
        p.setDescription(updated.getDescription());
        p.setImageUrl(updated.getImageUrl());
        p.setAvailable(updated.isAvailable());
        return repo.save(p);
    }

    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void delete(Long id) { repo.deleteById(id); }
}
