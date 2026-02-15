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

        // Set default status if not provided
        if (lead.getStatus() == null) {
            lead.setStatus(LeadStatus.OPEN);
        }

        // Save and return detailed response
        Lead savedLead = leadRepository.save(lead);
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
        lead.setPhoneNumber(leadCreateRequest.getPhoneNumber());
        lead.setDiplomaName(leadCreateRequest.getDiplomaName());
        lead.setModeratorNotes(leadCreateRequest.getModeratorNotes());
        lead.setClosureReason(leadCreateRequest.getClosureReason());

        // Get current authenticated user from SecurityContext
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + username));

            // Automatically assign TELESALES user to the lead
            lead.setTeleSales(currentUser);
        }

        // Set default status if not provided
        if (leadCreateRequest.getStatus() == null) {
            lead.setStatus(LeadStatus.OPEN);
        } else {
            lead.setStatus(leadCreateRequest.getStatus());
        }

        // Save and return detailed response
        Lead savedLead = leadRepository.save(lead);
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
    public Optional<LeadResponse> update(Lead leadToUpdate) {
        if (Objects.isNull(leadToUpdate) || Objects.isNull(leadToUpdate.getId())) {
            throw new IllegalArgumentException("Lead or Lead ID is null");
        }

        return leadRepository.findById(leadToUpdate.getId())
                .map(existingLead -> {
                    // Update fields
                    if (leadToUpdate.getPhoneNumber() != null) {
                        existingLead.setPhoneNumber(leadToUpdate.getPhoneNumber());
                    }
                    if (leadToUpdate.getDiplomaName() != null) {
                        existingLead.setDiplomaName(leadToUpdate.getDiplomaName());
                    }
                    if (leadToUpdate.getModeratorNotes() != null) {
                        existingLead.setModeratorNotes(leadToUpdate.getModeratorNotes());
                    }
                    if (leadToUpdate.getStatus() != null) {
                        existingLead.setStatus(leadToUpdate.getStatus());
                    }
                    if (leadToUpdate.getClosureReason() != null) {
                        existingLead.setClosureReason(leadToUpdate.getClosureReason());
                    }
                    if (leadToUpdate.getTeleSales() != null) {
                        existingLead.setTeleSales(leadToUpdate.getTeleSales());
                    }

                    Lead updatedLead = leadRepository.save(existingLead);
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


}
