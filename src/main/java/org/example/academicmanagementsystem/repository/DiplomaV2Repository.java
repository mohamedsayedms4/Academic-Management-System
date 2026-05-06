package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.DiplomaV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DiplomaV2Repository extends JpaRepository<DiplomaV2, Long> {
}
