package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.SalesV2Request;
import org.example.academicmanagementsystem.dto.SalesV2Response;
import org.example.academicmanagementsystem.service.SalesV2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/sales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesV2Controller {

    private final SalesV2Service service;

    @PostMapping
    public ResponseEntity<SalesV2Response> create(@RequestBody SalesV2Request request) {
        return ResponseEntity.ok(service.createSales(request));
    }

    @GetMapping
    public ResponseEntity<List<SalesV2Response>> getAll() {
        return ResponseEntity.ok(service.getAllSales());
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesV2Response> update(@PathVariable Long id, @RequestBody SalesV2Request request) {
        return ResponseEntity.ok(service.updateSales(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteSales(id);
        return ResponseEntity.noContent().build();
    }
}
