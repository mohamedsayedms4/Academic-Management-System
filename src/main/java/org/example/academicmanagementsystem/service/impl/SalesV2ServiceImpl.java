package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.SalesV2Request;
import org.example.academicmanagementsystem.dto.SalesV2Response;
import org.example.academicmanagementsystem.mapper.SalesV2Mapper;
import org.example.academicmanagementsystem.model.SalesV2;
import org.example.academicmanagementsystem.repository.SalesV2Repository;
import org.example.academicmanagementsystem.service.SalesV2Service;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalesV2ServiceImpl implements SalesV2Service {

    private final SalesV2Repository repository;
    private final SalesV2Mapper mapper;

    @Override
    public SalesV2Response createSales(SalesV2Request request) {
        SalesV2 sales = mapper.toEntity(request);
        sales.setJoinDate(LocalDate.now());
        return mapper.toResponse(repository.save(sales));
    }

    @Override
    public List<SalesV2Response> getAllSales() {
        return repository.findAll().stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SalesV2Response updateSales(Long id, SalesV2Request request) {
        SalesV2 sales = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sales person not found"));
        
        sales.setName(request.getName());
        sales.setPhone(request.getPhone());
        sales.setRole(request.getRole());
        sales.setCommission(request.getCommission());
        sales.setSalary(request.getSalary());
        sales.setPaymentMethod(request.getPaymentMethod());
        
        if (request.getUsername() != null) sales.setUsername(request.getUsername());
        if (request.getPassword() != null) sales.setPassword(request.getPassword());

        return mapper.toResponse(repository.save(sales));
    }

    @Override
    public void deleteSales(Long id) {
        repository.deleteById(id);
    }
}
