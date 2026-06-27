package com.sweetpos.service;

import com.sweetpos.entity.Supplier;
import com.sweetpos.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<Supplier> findAll() {
        return supplierRepository.findByActiveTrue();
    }

    public Supplier findById(UUID id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found"));
    }

    @Transactional
    public Supplier create(Supplier supplier) {
        supplier.setActive(true);
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier update(UUID id, Supplier updated) {
        Supplier supplier = findById(id);
        supplier.setName(updated.getName());
        supplier.setContactPerson(updated.getContactPerson());
        supplier.setPhone(updated.getPhone());
        supplier.setEmail(updated.getEmail());
        supplier.setAddress(updated.getAddress());
        supplier.setNotes(updated.getNotes());
        return supplierRepository.save(supplier);
    }

    @Transactional
    public void delete(UUID id) {
        Supplier supplier = findById(id);
        supplier.setActive(false);
        supplierRepository.save(supplier);
    }
}
