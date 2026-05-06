package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.InstallmentPlan;
import org.example.academicmanagementsystem.dto.PaymentSummary;
import org.example.academicmanagementsystem.dto.StudentRequest;
import org.example.academicmanagementsystem.dto.StudentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface StudentService {

    StudentResponse enrollStudent(StudentRequest studentRequest);

    Optional<StudentResponse> findById(Long id);

    Page<StudentResponse> findAll(Pageable pageable);

    Page<StudentResponse> getStudentsByRound(Long roundId, Pageable pageable);

    Optional<StudentResponse> update(Long id, StudentRequest studentRequest);

    InstallmentPlan calculateInstallments(Long studentId);

    PaymentSummary getPaymentSummary(Long studentId);

    List<StudentResponse> getStudentsWithOutstandingBalance();
}
