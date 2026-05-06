package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.InstructorV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructorV2Repository extends JpaRepository<InstructorV2, Long> {
    Page<InstructorV2> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
