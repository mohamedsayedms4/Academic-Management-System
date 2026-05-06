package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Diploma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DiplomaRepository extends JpaRepository<Diploma, Long> {
    Optional<Diploma> findByName(String name);
}
