package com.sweetpos.service;

import com.sweetpos.dto.CreateProductRequest;
import com.sweetpos.dto.ProductDto;
import com.sweetpos.entity.Category;
import com.sweetpos.entity.Product;
import com.sweetpos.repository.CategoryRepository;
import com.sweetpos.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public Page<ProductDto> findAll(String search, int page, int size) {
        if (search != null && !search.isBlank()) {
            return productRepository.search(search, PageRequest.of(page, size)).map(ProductDto::from);
        }
        return productRepository.findAll(PageRequest.of(page, size)).map(ProductDto::from);
    }

    public ProductDto findById(UUID id) {
        return ProductDto.from(productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found")));
    }

    public ProductDto findByBarcode(String barcode) {
        return ProductDto.from(productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found with barcode: " + barcode)));
    }

    public List<ProductDto> findByCategory(UUID categoryId) {
        return productRepository.findByActiveTrueAndCategory_Id(categoryId)
                .stream().map(ProductDto::from).toList();
    }

    public List<ProductDto> getLowStock() {
        return productRepository.findByActiveTrueAndStockQuantityLessThanEqual(5)
                .stream().map(ProductDto::from).toList();
    }

    @Transactional
    public ProductDto create(CreateProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .barcode(request.getBarcode())
                .sku(request.getSku())
                .costPrice(request.getCostPrice())
                .sellingPrice(request.getSellingPrice())
                .taxRate(request.getTaxRate() != null ? request.getTaxRate() : BigDecimal.ZERO)
                .stockQuantity(request.getStockQuantity() != null ? request.getStockQuantity() : 0)
                .minStockLevel(request.getMinStockLevel() != null ? request.getMinStockLevel() : 5)
                .unit(request.getUnit())
                .imageUrl(request.getImageUrl())
                .trackInventory(request.getTrackInventory() != null ? request.getTrackInventory() : true)
                .active(true)
                .build();

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId()).orElse(null);
            product.setCategory(cat);
        }

        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public ProductDto update(UUID id, CreateProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setBarcode(request.getBarcode());
        product.setSku(request.getSku());
        product.setCostPrice(request.getCostPrice());
        product.setSellingPrice(request.getSellingPrice());
        if (request.getTaxRate() != null) product.setTaxRate(request.getTaxRate());
        if (request.getStockQuantity() != null) product.setStockQuantity(request.getStockQuantity());
        if (request.getMinStockLevel() != null) product.setMinStockLevel(request.getMinStockLevel());
        product.setUnit(request.getUnit());
        product.setImageUrl(request.getImageUrl());
        if (request.getTrackInventory() != null) product.setTrackInventory(request.getTrackInventory());

        if (request.getCategoryId() != null) {
            Category cat = categoryRepository.findById(request.getCategoryId()).orElse(null);
            product.setCategory(cat);
        }

        return ProductDto.from(productRepository.save(product));
    }

    @Transactional
    public void delete(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setActive(false);
        productRepository.save(product);
    }

    @Transactional
    public void adjustStock(UUID productId, int quantity) {
        productRepository.adjustStock(productId, quantity);
    }

    public Product getEntity(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
}
