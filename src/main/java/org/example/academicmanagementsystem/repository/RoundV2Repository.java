package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoundV2Repository extends JpaRepository<RoundV2, Long> {
}
