package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Payment;
import org.example.academicmanagementsystem.model.PaymentType;
import org.example.academicmanagementsystem.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByStudent(Student student);

    Page<Payment> findByStudent(Student student, Pageable pageable);

    Optional<Payment> findByReceiptNumber(String receiptNumber);

    List<Payment> findByType(PaymentType type);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.student = :student")
    BigDecimal getTotalPaidByStudent(@Param("student") Student student);

    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :start AND :end")
    List<Payment> findPaymentsBetweenDates(@Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    @Query("SELECT p FROM Payment p WHERE p.student = :student ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPaymentsByStudent(@Param("student") Student student, Pageable pageable);
}
