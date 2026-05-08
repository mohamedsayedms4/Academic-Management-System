package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.SalesEarningsV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SalesEarningsV2Repository extends JpaRepository<SalesEarningsV2, Long> {
}
