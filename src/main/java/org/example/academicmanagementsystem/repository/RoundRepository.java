package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Round;
import org.example.academicmanagementsystem.model.RoundStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoundRepository extends JpaRepository<Round, Long> {

    List<Round> findByStatus(RoundStatus status);

    Page<Round> findRoundsByStatus(RoundStatus status, Pageable pageable);

    List<Round> findByDiploma_Name(String diplomaName);

    @Query("SELECT r FROM Round r WHERE r.startDate <= :date AND r.endDate >= :date")
    List<Round> findActiveRoundsOnDate(@Param("date") LocalDate date);
}
