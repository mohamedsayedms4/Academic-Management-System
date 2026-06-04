package org.example.academicmanagementsystem.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.LeadDetailResponse;
import org.example.academicmanagementsystem.dto.LeadRequest;
import org.example.academicmanagementsystem.dto.LeadResponse;
import org.example.academicmanagementsystem.mapper.LeadMapper;
import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.LeadRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.service.LeadService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LeadServiceImpl implements LeadService {

    private final LeadRepository leadRepository;
    private final LeadMapper leadMapper;
    private final UserRepository userRepository;
    private final org.example.academicmanagementsystem.repository.DiplomaRepository diplomaRepository;
    private final org.example.academicmanagementsystem.service.NotificationService notificationService;

    @Override
    public Optional<LeadResponse> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        return leadRepository.findById(id)
                .map(leadMapper::toLeadResponse);
    }

    @Override
    @Transactional
    public LeadDetailResponse save(LeadRequest leadRequest) {
        if (Objects.isNull(leadRequest)) {
            throw new IllegalArgumentException("LeadRequest is null");
        }

        // Convert DTO to entity
        Lead lead = leadMapper.toLeadEntity(leadRequest);

        // Get current authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + username));

            lead.setCreatedBy(username);
            lead.setUpdatedBy(username);

            // Check user role and assign telesales accordingly
            if (currentUser.getRole() == UserRole.ADMIN || currentUser.getRole() == UserRole.MODERATOR) {
                // ADMIN or MODERATOR can specify teleSalesId
                if (leadRequest.getTeleSalesId() != null) {
                    User teleSales = userRepository.findById(leadRequest.getTeleSalesId())
                            .orElseThrow(() -> new RuntimeException(
                                    "Telesales user not found with id: " + leadRequest.getTeleSalesId()));
                    lead.setTeleSales(teleSales);
                }
                // If no teleSalesId provided, leave it null
            } else if (currentUser.getRole() == UserRole.TELESALES) {
                // TELESALES user is automatically assigned to the lead
                lead.setTeleSales(currentUser);
            }
        }

        // Set Diploma if ID provided
        if (leadRequest.getDiplomaId() != null) {
            lead.setDiploma(diplomaRepository.findById(leadRequest.getDiplomaId())
                    .orElseThrow(() -> new RuntimeException("Diploma not found with id: " + leadRequest.getDiplomaId())));
        }

        // Set default status if not provided
        if (lead.getStatus() == null) {
            lead.setStatus(LeadStatus.OPEN);
        }

        boolean isNew = lead.getId() == null;

        // Save and return detailed response
        Lead savedLead = leadRepository.save(lead);

        if (isNew) {
            notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.ADMIN, org.example.academicmanagementsystem.model.NotificationType.LEAD_CREATED, "New lead created: " + savedLead.getFullName(), savedLead.getId());
            notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.MODERATOR, org.example.academicmanagementsystem.model.NotificationType.LEAD_CREATED, "New lead created: " + savedLead.getFullName(), savedLead.getId());
        }

        return leadMapper.toLeadDetailResponse(savedLead);
    }

    @Override
    @Transactional
    public LeadDetailResponse createLeadByTelesales(
            org.example.academicmanagementsystem.dto.LeadCreateRequest leadCreateRequest) {
        if (Objects.isNull(leadCreateRequest)) {
            throw new IllegalArgumentException("LeadCreateRequest is null");
        }

        // Convert DTO to entity
        Lead lead = new Lead();
        lead.setFullName(leadCreateRequest.getFullName());
        lead.setPhoneNumber(leadCreateRequest.getPhoneNumber());
        lead.setSource(leadCreateRequest.getSource());
        lead.setModeratorNotes(leadCreateRequest.getModeratorNotes());
        lead.setClosureReason(leadCreateRequest.getClosureReason());

        if (leadCreateRequest.getDiplomaId() != null) {
            lead.setDiploma(diplomaRepository.findById(leadCreateRequest.getDiplomaId())
                    .orElseThrow(() -> new RuntimeException("Diploma not found with id: " + leadCreateRequest.getDiplomaId())));
        }

        // Get current authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + username));

            // Automatically assign TELESALES user to the lead
            lead.setTeleSales(currentUser);
            lead.setCreatedBy(username);
            lead.setUpdatedBy(username);
        }


        // Set default status if not provided
        if (leadCreateRequest.getStatus() == null) {
            lead.setStatus(LeadStatus.OPEN);
        } else {
            lead.setStatus(leadCreateRequest.getStatus());
        }

        // Save and return detailed response
        Lead savedLead = leadRepository.save(lead);

        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.ADMIN, org.example.academicmanagementsystem.model.NotificationType.LEAD_CREATED, "New lead created by Telesales: " + savedLead.getFullName(), savedLead.getId());
        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.MODERATOR, org.example.academicmanagementsystem.model.NotificationType.LEAD_CREATED, "New lead created by Telesales: " + savedLead.getFullName(), savedLead.getId());

        return leadMapper.toLeadDetailResponse(savedLead);
    }

    @Override
    public Page<LeadResponse> findAll(Pageable pageable) {
        if (Objects.isNull(pageable)) {
            throw new IllegalArgumentException("Pageable is null");
        }

        return leadRepository.findAll(pageable)
                .map(leadMapper::toLeadResponse);
    }

    @Override
    @Transactional
    public Boolean deleteById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        if (!leadRepository.existsById(id)) {
            return false;
        }

        leadRepository.deleteById(id);
        return true;
    }

    @Override
    @Transactional
    public Optional<LeadResponse> update(Long id, LeadRequest leadRequest) {
        if (Objects.isNull(id) || Objects.isNull(leadRequest)) {
            throw new IllegalArgumentException("ID or LeadRequest is null");
        }

        return leadRepository.findById(id)
                .map(existingLead -> {
                    LeadStatus oldStatus = existingLead.getStatus();

                    // Update fields
                    if (leadRequest.getFullName() != null) {
                        existingLead.setFullName(leadRequest.getFullName());
                    }
                    if (leadRequest.getPhoneNumber() != null) {
                        existingLead.setPhoneNumber(leadRequest.getPhoneNumber());
                    }
                    if (leadRequest.getSource() != null) {
                        existingLead.setSource(leadRequest.getSource());
                    }
                    if (leadRequest.getDiplomaId() != null) {
                        existingLead.setDiploma(diplomaRepository.findById(leadRequest.getDiplomaId())
                                .orElseThrow(() -> new RuntimeException("Diploma not found with id: " + leadRequest.getDiplomaId())));
                    }
                    if (leadRequest.getModeratorNotes() != null) {
                        existingLead.setModeratorNotes(leadRequest.getModeratorNotes());
                    }
                    if (leadRequest.getStatus() != null) {
                        existingLead.setStatus(leadRequest.getStatus());
                    }
                    if (leadRequest.getClosureReason() != null) {
                        existingLead.setClosureReason(leadRequest.getClosureReason());
                    }
                    if (leadRequest.getTeleSalesId() != null) {
                        User teleSales = userRepository.findById(leadRequest.getTeleSalesId())
                                .orElseThrow(() -> new RuntimeException("Telesales user not found with id: " + leadRequest.getTeleSalesId()));
                        existingLead.setTeleSales(teleSales);
                    }

                    Lead updatedLead = leadRepository.save(existingLead);

                    if (leadRequest.getStatus() != null && oldStatus != updatedLead.getStatus()) {
                        String message = "Lead status updated for " + updatedLead.getFullName() + " to " + updatedLead.getStatus();
                        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.ADMIN, org.example.academicmanagementsystem.model.NotificationType.LEAD_STATUS_CHANGED, message, updatedLead.getId());
                        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.MODERATOR, org.example.academicmanagementsystem.model.NotificationType.LEAD_STATUS_CHANGED, message, updatedLead.getId());
                        if (updatedLead.getTeleSales() != null) {
                            notificationService.createForUser(updatedLead.getTeleSales().getId(), org.example.academicmanagementsystem.model.NotificationType.LEAD_STATUS_CHANGED, message, updatedLead.getId());
                        }
                    }

                    return leadMapper.toLeadResponse(updatedLead);
                });
    }

    @Override
    public Integer count() {
        return (int) leadRepository.count();
    }

    @Override
    public Integer LeadCompleted() {
        return leadRepository.findByStatus(LeadStatus.CLOSED).size();
    }

    @Override
    public Integer LeadInProgress() {
        return leadRepository.findByStatus(LeadStatus.OPEN).size();
    }

    @Override
    public Integer LeadPending() {
        // Assuming OPEN leads without assigned telesales are "pending"
        return (int) leadRepository.findByStatus(LeadStatus.OPEN).stream()
                .filter(lead -> lead.getTeleSales() == null)
                .count();
    }

    @Override
    public Integer LeadCancelled() {
        // Assuming closed leads with closure reason are "cancelled"
        return (int) leadRepository.findByStatus(LeadStatus.CLOSED).stream()
                .filter(lead -> lead.getClosureReason() != null && !lead.getClosureReason().isEmpty())
                .count();
    }

    @Override
    public Page<LeadResponse> getLeadsByStatus(Pageable pageable , LeadStatus leadStatus ) {

        return  leadRepository.findLeadsByStatus(leadStatus, pageable).map(leadMapper::toLeadResponse);
    }

    @Override
    public java.util.List<org.example.academicmanagementsystem.dto.ModeratorLeaderboardResponse> getModeratorLeaderboard() {
        java.time.LocalDate today = java.time.LocalDate.now();
        int daysToSubtract = today.getDayOfWeek().getValue() % 7; 
        java.time.LocalDate startOfWeekDate = today.minusDays(daysToSubtract);
        java.time.LocalDateTime startOfWeek = startOfWeekDate.atStartOfDay();

        java.util.List<User> moderators = userRepository.findByRole(UserRole.MODERATOR);
        java.util.List<org.example.academicmanagementsystem.dto.ModeratorLeaderboardResponse> response = new java.util.ArrayList<>();

        for (User moderator : moderators) {
            long count = leadRepository.countByCreatedByAndCreatedAtGreaterThanEqual(moderator.getUsername(), startOfWeek);
            response.add(new org.example.academicmanagementsystem.dto.ModeratorLeaderboardResponse(moderator.getFullName(), count));
        }

        // Sort descending by leadCount
        response.sort((r1, r2) -> Long.compare(r2.getLeadCount(), r1.getLeadCount()));
        return response;
    }

    @Override
    public java.util.Map<String, Integer> getLeadStatistics() {
        java.util.List<Lead> allLeads = leadRepository.findAll();
        
        int total = allLeads.size();
        int opened = (int) allLeads.stream()
                .filter(l -> l.getStatus() == LeadStatus.OPEN || l.getStatus() == LeadStatus.INTERESTED || l.getStatus() == LeadStatus.FOLLOW_UP)
                .count();
        int closed = (int) allLeads.stream()
                .filter(l -> l.getStatus() == LeadStatus.CLOSED || l.getStatus() == LeadStatus.REJECTED)
                .count();
        int enrolled = (int) allLeads.stream()
                .filter(l -> l.getStatus() == LeadStatus.ENROLLED)
                .count();
        int countries = (int) allLeads.stream()
                .map(Lead::getSource)
                .filter(Objects::nonNull)
                .filter(s -> !s.trim().isEmpty())
                .distinct()
                .count();
        if (countries == 0 && total > 0) {
            countries = 1;
        }
        int noResponses = (int) allLeads.stream()
                .filter(l -> l.getFollowUps() == null || l.getFollowUps().isEmpty())
                .count();

        java.util.Map<String, Integer> statistics = new java.util.HashMap<>();
        statistics.put("total", total);
        statistics.put("opened", opened);
        statistics.put("closed", closed);
        statistics.put("enrolled", enrolled);
        statistics.put("countries", countries);
        statistics.put("noResponses", noResponses);
        
        // For backwards compatibility
        statistics.put("completed", enrolled);
        statistics.put("inProgress", opened);
        statistics.put("pending", opened);
        statistics.put("cancelled", closed);

        return statistics;
    }

    @Override
    @jakarta.transaction.Transactional
    public LeadDetailResponse addFollowUp(Long leadId, org.example.academicmanagementsystem.dto.FollowUpRequest request) {
        Lead lead = leadRepository.findById(leadId)
                .orElseThrow(() -> new RuntimeException("Lead not found with id: " + leadId));

        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        User currentUser = null;
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            currentUser = userRepository.findByUsername(username).orElse(null);
        }

        if (lead.getFollowUps() == null) {
            lead.setFollowUps(new java.util.ArrayList<>());
        }

        if (lead.getFollowUps().size() >= 3) {
            throw new RuntimeException("You have reached the maximum number of call attempts (3/3).");
        }

        org.example.academicmanagementsystem.model.FollowUp followUp = new org.example.academicmanagementsystem.model.FollowUp();
        followUp.setLead(lead);
        followUp.setSequence(lead.getFollowUps().size() + 1);
        followUp.setMessage(request.getMessage());
        followUp.setEmployee(currentUser);
        followUp.setStatus(request.getStatus());

        if (request.getCreatedAt() != null) {
            followUp.setCreatedAt(request.getCreatedAt());
        } else {
            followUp.setCreatedAt(java.time.LocalDateTime.now());
        }
        followUp.setUpdatedAt(java.time.LocalDateTime.now());

        if (request.getStatus() != null) {
            lead.setStatus(request.getStatus());
        }

        lead.getFollowUps().add(followUp);
        Lead savedLead = leadRepository.save(lead);

        return leadMapper.toLeadDetailResponse(savedLead);
    }
}
