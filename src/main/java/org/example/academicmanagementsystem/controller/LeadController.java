package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.LeadDetailResponse;
import org.example.academicmanagementsystem.dto.LeadRequest;
import org.example.academicmanagementsystem.dto.LeadResponse;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.example.academicmanagementsystem.service.LeadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    // Create a new lead by ADMIN/MODERATOR - can specify teleSalesId
    @PostMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<LeadDetailResponse> createLeadByAdmin(@RequestBody LeadRequest leadRequest) {
        LeadDetailResponse createdLead = leadService.save(leadRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLead);
    }

    // Create a new lead by TELESALES - auto-assigned to current user
    @PostMapping("/telesales")
    @PreAuthorize("hasRole('TELESALES')")
    public ResponseEntity<LeadDetailResponse> createLeadByTelesales(
            @RequestBody org.example.academicmanagementsystem.dto.LeadCreateRequest leadCreateRequest) {
        LeadDetailResponse createdLead = leadService.createLeadByTelesales(leadCreateRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdLead);
    }

    // Get all leads with pagination - accessible by all authenticated users
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<LeadResponse>> getAllLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<LeadResponse> leads = leadService.findAll(pageable);
        return ResponseEntity.ok(leads);
    }

    // Get lead by ID - accessible by all authenticated users
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeadResponse> getLeadById(@PathVariable Long id) {
        Optional<LeadResponse> lead = leadService.findById(id);
        return lead.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update lead - accessible by ADMIN, MODERATOR, TELESALES
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'TELESALES')")
    public ResponseEntity<LeadResponse> updateLead(
            @PathVariable Long id,
            @RequestBody LeadRequest leadRequest) {
        return leadService.findById(id)
                .map(existingLead -> {
                    // Create Lead entity with updated fields
                    org.example.academicmanagementsystem.model.Lead leadToUpdate = new org.example.academicmanagementsystem.model.Lead();
                    leadToUpdate.setId(id);
                    leadToUpdate.setPhoneNumber(leadRequest.getPhoneNumber());
                    leadToUpdate.setDiplomaName(leadRequest.getDiplomaName());
                    leadToUpdate.setModeratorNotes(leadRequest.getModeratorNotes());
                    leadToUpdate.setStatus(leadRequest.getStatus());
                    leadToUpdate.setClosureReason(leadRequest.getClosureReason());

                    Optional<LeadResponse> updated = leadService.update(leadToUpdate);
                    return updated.map(ResponseEntity::ok)
                            .orElse(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete lead - accessible by ADMIN only
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteLead(@PathVariable Long id) {
        Boolean deleted = leadService.deleteById(id);

        Map<String, String> response = new HashMap<>();
        if (deleted) {
            response.put("message", "Lead deleted successfully");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Lead not found");
            return ResponseEntity.notFound().build();
        }
    }

    // Get leads statistics - accessible by ADMIN, MODERATOR
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Integer>> getLeadStatistics() {
        Map<String, Integer> statistics = new HashMap<>();
        statistics.put("total", leadService.count());
        statistics.put("completed", leadService.LeadCompleted());
        statistics.put("inProgress", leadService.LeadInProgress());
        statistics.put("pending", leadService.LeadPending());
        statistics.put("cancelled", leadService.LeadCancelled());

        return ResponseEntity.ok(statistics);
    }

    // Filter leads by status - accessible by all authenticated users
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<LeadResponse>> getLeadsByStatus(
            @PathVariable LeadStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<LeadResponse> leads =
                leadService.getLeadsByStatus(pageable , status);

        return ResponseEntity.ok(leads);
    }

    // Get count of all leads - accessible by all authenticated users
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Integer>> getLeadCount() {
        Map<String, Integer> response = new HashMap<>();
        response.put("count", leadService.count());
        return ResponseEntity.ok(response);
    }

    // Health check endpoint - public access
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Lead Service");
        return ResponseEntity.ok(response);
    }
}
