package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.SalesV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesV2Repository extends JpaRepository<SalesV2, Long> {
}
