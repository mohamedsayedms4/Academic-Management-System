package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundDiploma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundDiplomaRepository extends JpaRepository<RoundDiploma, Long> {
}
