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
}
