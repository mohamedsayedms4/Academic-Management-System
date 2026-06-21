package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.LeadCreateRequest;
import org.example.academicmanagementsystem.dto.LeadDetailResponse;
import org.example.academicmanagementsystem.dto.LeadRequest;
import org.example.academicmanagementsystem.dto.LeadResponse;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface LeadService {

    Optional<LeadResponse> findById(Long id);

    // For ADMIN/MODERATOR - can specify teleSalesId
    LeadDetailResponse save(LeadRequest lead);

    // For TELESALES - auto-assigns current user
    LeadDetailResponse createLeadByTelesales(LeadCreateRequest leadCreateRequest);

    Page<LeadResponse> findAll(Pageable pageable);

    Boolean deleteById(Long id);

    Optional<LeadResponse> update(Long id, LeadRequest leadRequest);

    Integer count();

    Integer LeadCompleted();

    Integer LeadInProgress();

    Integer LeadPending();

    Integer LeadCancelled();

    Page<LeadResponse> getLeadsByStatus(Pageable pageable, LeadStatus leadStatus);

    Map<String, Integer> getLeadStatistics();

    LeadDetailResponse addFollowUp(Long leadId, org.example.academicmanagementsystem.dto.FollowUpRequest request);

    List<org.example.academicmanagementsystem.dto.ModeratorLeaderboardResponse> getModeratorLeaderboard();

    // ---- New methods for distribution system ----

    /** Returns paginated leads assigned to the currently authenticated TELESALES user */
    Page<LeadResponse> getMyLeads(Pageable pageable, LeadStatus status);

    /** Returns statistics for the currently authenticated TELESALES user */
    Map<String, Long> getMyLeadsStats();

    /** Bulk-imports a list of leads (MODERATOR/ADMIN only). Returns saved leads. */
    List<LeadDetailResponse> bulkImport(List<LeadRequest> leads);

    /**
     * Distributes unassigned leads round-robin across all active TELESALES users.
     * @param leadsPerAgent max leads per agent in this batch (default 30, 0 = distribute all)
     * @return summary map: agentName -> leadsAssigned, plus "total" key
     */
    Map<String, Object> distributeLeads(int leadsPerAgent);

    /** Returns paginated leads that have no telesales agent assigned */
    Page<LeadResponse> getUnassignedLeads(Pageable pageable);

    /** Returns performance stats for every TELESALES agent (for MODERATOR view) */
    List<Map<String, Object>> getTelesalesPerformance();
}


