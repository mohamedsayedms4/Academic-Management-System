package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.SalesEarningsV2Response;
import org.example.academicmanagementsystem.service.EarningsV2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/earnings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EarningsV2Controller {

    private final EarningsV2Service service;

    @GetMapping
    public ResponseEntity<List<SalesEarningsV2Response>> getAll() {
        return ResponseEntity.ok(service.getAllEarnings());
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<SalesEarningsV2Response> markAsPaid(@PathVariable Long id) {
        return ResponseEntity.ok(service.markAsPaid(id));
    }

    @PostMapping("/{id}/revert")
    public ResponseEntity<SalesEarningsV2Response> revertToPending(@PathVariable Long id) {
        return ResponseEntity.ok(service.revertToPending(id));
    }
}
