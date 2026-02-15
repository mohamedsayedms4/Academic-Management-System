package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Find leads by status
    List<Lead> findByStatus(LeadStatus status);

    // Find leads assigned to a specific telesales user
    List<Lead> findByTeleSalesId(Long teleSalesId);

    // Find leads by status and assigned telesales user
    List<Lead> findByStatusAndTeleSalesId(LeadStatus status, Long teleSalesId);

    // Find leads by phone number
    List<Lead> findByPhoneNumber(String phoneNumber);

    // Check if a lead with phone number exists
    boolean existsByPhoneNumber(String phoneNumber);

    // Find All leads as a page filtering by status
    Page <Lead> findLeadsByStatus(LeadStatus status,
                                  Pageable pageable);
}
