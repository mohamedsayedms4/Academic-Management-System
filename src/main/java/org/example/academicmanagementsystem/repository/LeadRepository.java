package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {

    // Find leads by status
    List<Lead> findByStatus(LeadStatus status);

    // Find leads assigned to a specific telesales user (list)
    List<Lead> findByTeleSalesId(Long teleSalesId);

    // Find leads assigned to a specific telesales user (paginated)
    Page<Lead> findByTeleSalesId(Long teleSalesId, Pageable pageable);

    // Find leads assigned to a specific telesales user filtered by status (paginated)
    Page<Lead> findByTeleSalesIdAndStatus(Long teleSalesId, LeadStatus status, Pageable pageable);

    // Find leads by status and assigned telesales user
    List<Lead> findByStatusAndTeleSalesId(LeadStatus status, Long teleSalesId);

    // Find leads by phone number
    List<Lead> findByPhoneNumber(String phoneNumber);

    // Check if a lead with phone number exists
    boolean existsByPhoneNumber(String phoneNumber);

    // Find All leads as a page filtering by status
    Page<Lead> findLeadsByStatus(LeadStatus status, Pageable pageable);

    // Find leads that have NOT been assigned to any telesales agent
    List<Lead> findByTeleSalesIsNull();

    // Find unassigned leads paginated
    Page<Lead> findByTeleSalesIsNull(Pageable pageable);

    // Count leads assigned to a specific telesales agent
    long countByTeleSalesId(Long teleSalesId);

    // Count leads by status for a specific telesales agent
    long countByTeleSalesIdAndStatus(Long teleSalesId, LeadStatus status);

    // Find count of leads created by a moderator in this week
    @Query("SELECT COUNT(l) FROM Lead l WHERE l.createdBy = :username AND l.createdAt >= :startDate")
    long countByCreatedByAndCreatedAtGreaterThanEqual(@Param("username") String username, @Param("startDate") java.time.LocalDateTime startDate);

    // Get telesales performance: each agent's lead counts grouped by status
    @Query("SELECT l.teleSales.id, l.status, COUNT(l) FROM Lead l WHERE l.teleSales IS NOT NULL GROUP BY l.teleSales.id, l.status")
    List<Object[]> getTelesalesPerformanceGrouped();

    // Count total leads per telesales agent
    @Query("SELECT l.teleSales.id, COUNT(l) FROM Lead l WHERE l.teleSales IS NOT NULL GROUP BY l.teleSales.id")
    List<Object[]> countLeadsPerTelesales();
}


