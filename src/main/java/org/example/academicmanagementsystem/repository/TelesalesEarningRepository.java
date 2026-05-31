package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.TelesalesEarning;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelesalesEarningRepository extends JpaRepository<TelesalesEarning, Long> {

    Optional<TelesalesEarning> findByTelesalesId(Long telesalesId);

    @Query("SELECT te FROM TelesalesEarning te WHERE " +
           "(:status IS NULL OR te.status = :status) AND " +
           "(:search IS NULL OR LOWER(te.telesales.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(te.telesales.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<TelesalesEarning> searchEarnings(@Param("status") String status, @Param("search") String search);
}
