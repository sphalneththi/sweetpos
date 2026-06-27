package com.sweetpos.service;

import com.sweetpos.entity.Customer;
import com.sweetpos.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public Page<Customer> findAll(String search, int page, int size) {
        if (search != null && !search.isBlank()) {
            return customerRepository.search(search, PageRequest.of(page, size));
        }
        return customerRepository.findAll(PageRequest.of(page, size));
    }

    public Customer findById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @Transactional
    public Customer create(Customer customer) {
        customer.setActive(true);
        customer.setLoyaltyPoints(0);
        customer.setTotalSpent(BigDecimal.ZERO);
        customer.setVisitCount(0);
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer update(UUID id, Customer updated) {
        Customer customer = findById(id);
        customer.setName(updated.getName());
        customer.setPhone(updated.getPhone());
        customer.setEmail(updated.getEmail());
        customer.setAddress(updated.getAddress());
        customer.setNotes(updated.getNotes());
        return customerRepository.save(customer);
    }

    @Transactional
    public void addLoyaltyPoints(UUID customerId, int points, BigDecimal amount) {
        Customer customer = findById(customerId);
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() + points);
        customer.setTotalSpent(customer.getTotalSpent().add(amount));
        customer.setVisitCount(customer.getVisitCount() + 1);
        customerRepository.save(customer);
    }

    @Transactional
    public void redeemLoyaltyPoints(UUID customerId, int points) {
        Customer customer = findById(customerId);
        if (customer.getLoyaltyPoints() < points) {
            throw new RuntimeException("Insufficient loyalty points");
        }
        customer.setLoyaltyPoints(customer.getLoyaltyPoints() - points);
        customerRepository.save(customer);
    }

    @Transactional
    public void delete(UUID id) {
        Customer customer = findById(id);
        customer.setActive(false);
        customerRepository.save(customer);
    }
}
