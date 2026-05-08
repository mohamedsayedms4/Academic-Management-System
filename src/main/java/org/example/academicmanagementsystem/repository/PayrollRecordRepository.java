package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.PayrollRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollRecordRepository extends JpaRepository<PayrollRecord, Long> {
    Optional<PayrollRecord> findByMonth(String month);
}
