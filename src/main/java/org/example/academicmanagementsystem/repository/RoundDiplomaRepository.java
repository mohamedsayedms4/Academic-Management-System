package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundDiploma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoundDiplomaRepository extends JpaRepository<RoundDiploma, Long> {
    
    @Query("SELECT rd FROM RoundDiploma rd WHERE " +
           "(rd.installment1Date BETWEEN :start AND :end) OR " +
           "(rd.installment2Date BETWEEN :start AND :end) OR " +
           "(rd.installment3Date BETWEEN :start AND :end) OR " +
           "(rd.installment4Date BETWEEN :start AND :end)")
    List<RoundDiploma> findWithInstallmentsInMonth(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
