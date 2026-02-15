package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.LeadCreateRequest;
import org.example.academicmanagementsystem.dto.LeadDetailResponse;
import org.example.academicmanagementsystem.dto.LeadRequest;
import org.example.academicmanagementsystem.dto.LeadResponse;
import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface LeadService {

    Optional<LeadResponse> findById(Long id);

    // For ADMIN/MODERATOR - can specify teleSalesId
    LeadDetailResponse save(LeadRequest lead);

    // For TELESALES - auto-assigns current user
    LeadDetailResponse createLeadByTelesales(LeadCreateRequest leadCreateRequest);

    Page<LeadResponse> findAll(Pageable pageable);

    Boolean deleteById(Long id);

    Optional<LeadResponse> update(Lead LeadRequest);

    Integer count();

    Integer LeadCompleted();

    Integer LeadInProgress();

    Integer LeadPending();

    Integer LeadCancelled();

    Page<LeadResponse> getLeadsByStatus(Pageable pageable , LeadStatus leadStatus );
}
