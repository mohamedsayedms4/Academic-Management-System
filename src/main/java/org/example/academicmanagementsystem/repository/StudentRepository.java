package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.PaymentStatus;
import org.example.academicmanagementsystem.model.RoundDiploma;
import org.example.academicmanagementsystem.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByPhone(String phone);

    List<Student> findByRoundDiploma(RoundDiploma roundDiploma);

    Page<Student> findByRoundDiploma(RoundDiploma roundDiploma, Pageable pageable);

    List<Student> findByPaymentStatus(PaymentStatus status);

    @Query("SELECT s FROM Student s WHERE s.remainingAmount > 0")
    List<Student> findStudentsWithOutstandingBalance();

    @Query("SELECT s FROM Student s WHERE s.roundDiploma = :roundDiploma ORDER BY s.enrollmentDate DESC")
    List<Student> findRecentStudentsByRoundDiploma(RoundDiploma roundDiploma, Pageable pageable);
}
