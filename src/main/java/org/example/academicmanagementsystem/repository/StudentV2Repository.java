package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.StudentStatus;
import org.example.academicmanagementsystem.model.StudentV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentV2Repository extends JpaRepository<StudentV2, Long> {
    Page<StudentV2> findByStatus(StudentStatus status, Pageable pageable);
    Page<StudentV2> findByStatusAndNameContainingIgnoreCase(StudentStatus status, String name, Pageable pageable);
    
    Page<StudentV2> findByRoundAndDiploma(org.example.academicmanagementsystem.model.RoundV2 round, org.example.academicmanagementsystem.model.DiplomaV2 diploma, Pageable pageable);
    
    @org.springframework.data.jpa.repository.Query("SELECT s FROM StudentV2 s WHERE s.round = :round AND s.diploma = :diploma AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.phone) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<StudentV2> searchInRoundDiploma(@org.springframework.data.repository.query.Param("round") org.example.academicmanagementsystem.model.RoundV2 round, @org.springframework.data.repository.query.Param("diploma") org.example.academicmanagementsystem.model.DiplomaV2 diploma, @org.springframework.data.repository.query.Param("search") String search, Pageable pageable);
}
