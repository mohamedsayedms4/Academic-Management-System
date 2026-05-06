package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundRequest;
import org.example.academicmanagementsystem.dto.RoundResponse;
import org.example.academicmanagementsystem.model.RoundStatus;
import org.example.academicmanagementsystem.service.RoundService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rounds")
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;

    // Create a new round - accessible by ADMIN, MODERATOR
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<RoundResponse> createRound(@RequestBody RoundRequest roundRequest) {
        RoundResponse createdRound = roundService.save(roundRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRound);
    }

    // Get all rounds with pagination - accessible by all authenticated users
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<RoundResponse>> getAllRounds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<RoundResponse> rounds = roundService.findAll(pageable);
        return ResponseEntity.ok(rounds);
    }

    // Get round by ID - accessible by all authenticated users
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoundResponse> getRoundById(@PathVariable Long id) {
        return roundService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update round - accessible by ADMIN, MODERATOR
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<RoundResponse> updateRound(
            @PathVariable Long id,
            @RequestBody RoundRequest roundRequest) {
        return roundService.update(id, roundRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete round - accessible by ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteRound(@PathVariable Long id) {
        Boolean deleted = roundService.deleteById(id);

        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("message", "Round deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Round not found");
            return ResponseEntity.notFound().build();
        }
    }

    // Get rounds statistics - accessible by ADMIN, MODERATOR
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Integer>> getRoundStatistics() {
        Map<String, Integer> statistics = new HashMap<>();
        statistics.put("total", roundService.count());
        statistics.put("active", roundService.countByStatus(RoundStatus.ACTIVE));
        statistics.put("inProgress", roundService.countByStatus(RoundStatus.INPROGRESS));
        statistics.put("completed", roundService.countByStatus(RoundStatus.COMPLETED));
        statistics.put("cancelled", roundService.countByStatus(RoundStatus.CANCELLED));

        return ResponseEntity.ok(statistics);
    }

    // Filter rounds by status - accessible by all authenticated users
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<RoundResponse>> getRoundsByStatus(
            @PathVariable RoundStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("startDate").descending());
        Page<RoundResponse> rounds = roundService.getRoundsByStatus(pageable, status);

        return ResponseEntity.ok(rounds);
    }

    // Health check endpoint - public access
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Round Service");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/diplomas")
    public List<org.example.academicmanagementsystem.dto.RoundDiplomaResponse> getDiplomasByRound(@PathVariable Long id) {
        return roundService.findById(id)
                .map(org.example.academicmanagementsystem.dto.RoundResponse::getDiplomas)
                .orElseThrow(() -> new RuntimeException("Round not found with id: " + id));
    }
}
