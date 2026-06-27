package com.sweetpos.service;

import com.sweetpos.entity.Category;
import com.sweetpos.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> findAll() {
        return categoryRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    public Category findById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Transactional
    public Category create(Category category) {
        category.setActive(true);
        return categoryRepository.save(category);
    }

    @Transactional
    public Category update(UUID id, Category updated) {
        Category category = findById(id);
        category.setName(updated.getName());
        category.setDescription(updated.getDescription());
        category.setColor(updated.getColor());
        category.setIcon(updated.getIcon());
        category.setSortOrder(updated.getSortOrder());
        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(UUID id) {
        Category category = findById(id);
        category.setActive(false);
        categoryRepository.save(category);
    }
}
