package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.DiplomaResponse;
import org.example.academicmanagementsystem.service.DiplomaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/diplomas")
@RequiredArgsConstructor
public class DiplomaController {

    private final DiplomaService diplomaService;

    @GetMapping
    public ResponseEntity<List<DiplomaResponse>> getAllDiplomas() {
        return ResponseEntity.ok(diplomaService.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiplomaResponse> createDiploma(@RequestBody Map<String, String> request) {
        DiplomaResponse diploma = diplomaService.create(request.get("name"), request.get("description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(diploma);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiplomaResponse> updateDiploma(@PathVariable Long id, @RequestBody Map<String, String> request) {
        return diplomaService.update(id, request.get("name"), request.get("description"))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDiploma(@PathVariable Long id) {
        diplomaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
