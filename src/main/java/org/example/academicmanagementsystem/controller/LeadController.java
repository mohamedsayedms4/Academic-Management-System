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
import java.util.List;
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
        return leadService.update(id, leadRequest)
                .map(ResponseEntity::ok)
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
        return ResponseEntity.ok(leadService.getLeadStatistics());
    }

    // Get moderator leaderboard - accessible by all authenticated users
    @GetMapping("/leaderboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<org.example.academicmanagementsystem.dto.ModeratorLeaderboardResponse>> getModeratorLeaderboard() {
        return ResponseEntity.ok(leadService.getModeratorLeaderboard());
    }

    // Filter leads by status - accessible by all authenticated users
    @GetMapping("/status/{status}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<LeadResponse>> getLeadsByStatus(
            @PathVariable LeadStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<LeadResponse> leads = leadService.getLeadsByStatus(pageable, status);
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

    // Add call attempt / follow-up - accessible by ADMIN, MODERATOR, TELESALES
    @PostMapping("/{id}/follow-ups")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'TELESALES')")
    public ResponseEntity<LeadDetailResponse> addFollowUp(
            @PathVariable Long id,
            @RequestBody org.example.academicmanagementsystem.dto.FollowUpRequest followUpRequest) {
        LeadDetailResponse updatedLead = leadService.addFollowUp(id, followUpRequest);
        return ResponseEntity.ok(updatedLead);
    }

    // Health check endpoint - public access
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Lead Service");
        return ResponseEntity.ok(response);
    }

    // ---- NEW ENDPOINTS ----

    /**
     * GET /api/v1/leads/my-leads
     * Returns paginated leads assigned to the currently logged-in TELESALES user.
     * Optional ?status=OPEN|INTERESTED|... filter.
     */
    @GetMapping("/my-leads")
    @PreAuthorize("hasAnyRole('TELESALES', 'ADMIN', 'MODERATOR')")
    public ResponseEntity<Page<LeadResponse>> getMyLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(required = false) LeadStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        return ResponseEntity.ok(leadService.getMyLeads(pageable, status));
    }

    /**
     * GET /api/v1/leads/my-leads/stats
     * Returns status breakdown statistics for the currently logged-in TELESALES user.
     */
    @GetMapping("/my-leads/stats")
    @PreAuthorize("hasAnyRole('TELESALES', 'ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Long>> getMyLeadsStats() {
        return ResponseEntity.ok(leadService.getMyLeadsStats());
    }

    /**
     * POST /api/v1/leads/bulk-import
     * Bulk-creates leads from a JSON array. Leads are left unassigned (teleSales = null).
     * MODERATOR / ADMIN only.
     */
    @PostMapping("/bulk-import")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<LeadDetailResponse>> bulkImport(@RequestBody List<LeadRequest> leads) {
        List<LeadDetailResponse> saved = leadService.bulkImport(leads);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * POST /api/v1/leads/distribute
     * Distributes unassigned leads round-robin across all active TELESALES agents.
     * @param leadsPerAgent max leads to assign per agent (default 30; 0 = all remaining)
     */
    @PostMapping("/distribute")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Map<String, Object>> distributeLeads(
            @RequestParam(defaultValue = "30") int leadsPerAgent) {
        Map<String, Object> result = leadService.distributeLeads(leadsPerAgent);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/v1/leads/unassigned
     * Returns paginated leads that have no telesales agent assigned yet.
     * MODERATOR / ADMIN only.
     */
    @GetMapping("/unassigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<Page<LeadResponse>> getUnassignedLeads(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(leadService.getUnassignedLeads(pageable));
    }

    /**
     * GET /api/v1/leads/telesales-performance
     * Returns a per-agent breakdown of lead counts by status (for MODERATOR dashboard).
     */
    @GetMapping("/telesales-performance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<List<Map<String, Object>>> getTelesalesPerformance() {
        return ResponseEntity.ok(leadService.getTelesalesPerformance());
    }
}

