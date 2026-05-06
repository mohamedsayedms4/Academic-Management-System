package org.example.academicmanagementsystem.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.*;
import org.example.academicmanagementsystem.mapper.PaymentMapper;
import org.example.academicmanagementsystem.mapper.StudentMapper;
import org.example.academicmanagementsystem.model.*;
import org.example.academicmanagementsystem.repository.PaymentRepository;
import org.example.academicmanagementsystem.repository.RoundDiplomaRepository;
import org.example.academicmanagementsystem.repository.StudentRepository;
import org.example.academicmanagementsystem.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final StudentRepository studentRepository;
    private final RoundDiplomaRepository roundDiplomaRepository;
    private final PaymentRepository paymentRepository;
    private final StudentMapper studentMapper;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public StudentResponse enrollStudent(StudentRequest studentRequest) {
        if (Objects.isNull(studentRequest)) {
            throw new IllegalArgumentException("StudentRequest is null");
        }

        // Validate and get roundDiploma
        RoundDiploma roundDiploma = roundDiplomaRepository.findById(studentRequest.getRoundDiplomaId())
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found with id: " + studentRequest.getRoundDiplomaId()));

        // Check if roundDiploma has capacity
        if (roundDiploma.getCurrentEnrollment() >= roundDiploma.getTotalStudents()) {
            throw new RuntimeException("This diploma batch is full. Cannot enroll more students.");
        }

        // Check if phone already exists
        Optional<Student> existingStudent = studentRepository.findByPhone(studentRequest.getPhone());
        if (existingStudent.isPresent()) {
            throw new RuntimeException("Student with this phone number already exists");
        }

        // Create student entity
        Student student = new Student();
        student.setName(studentRequest.getName());
        student.setPhone(studentRequest.getPhone());
        student.setEmail(studentRequest.getEmail());
        student.setRoundDiploma(roundDiploma);
        student.setTotalFees(studentRequest.getTotalFees());
        student.setPaidAmount(BigDecimal.ZERO);
        student.setRemainingAmount(studentRequest.getTotalFees());
        student.setPaymentStatus(PaymentStatus.PENDING);
        student.setEnrollmentDate(LocalDateTime.now());

        // Increment roundDiploma's current enrollment
        roundDiploma.setCurrentEnrollment(roundDiploma.getCurrentEnrollment() + 1);

        // Save student and update roundDiploma
        Student savedStudent = studentRepository.save(student);
        roundDiplomaRepository.save(roundDiploma);

        return studentMapper.toStudentResponse(savedStudent);
    }

    @Override
    public Optional<StudentResponse> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        return studentRepository.findById(id)
                .map(studentMapper::toStudentResponse);
    }

    @Override
    public Page<StudentResponse> findAll(Pageable pageable) {
        if (Objects.isNull(pageable)) {
            throw new IllegalArgumentException("Pageable is null");
        }

        return studentRepository.findAll(pageable)
                .map(studentMapper::toStudentResponse);
    }

    @Override
    public Page<StudentResponse> getStudentsByRound(Long roundDiplomaId, Pageable pageable) {
        if (Objects.isNull(roundDiplomaId) || Objects.isNull(pageable)) {
            throw new IllegalArgumentException("RoundDiplomaId or Pageable is null");
        }

        RoundDiploma roundDiploma = roundDiplomaRepository.findById(roundDiplomaId)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found with id: " + roundDiplomaId));

        return studentRepository.findByRoundDiploma(roundDiploma, pageable)
                .map(studentMapper::toStudentResponse);
    }

    @Override
    @Transactional
    public Optional<StudentResponse> update(Long id, StudentRequest studentRequest) {
        if (Objects.isNull(id) || Objects.isNull(studentRequest)) {
            throw new IllegalArgumentException("ID or StudentRequest is null");
        }

        return studentRepository.findById(id)
                .map(existingStudent -> {
                    // Update fields
                    if (studentRequest.getName() != null) {
                        existingStudent.setName(studentRequest.getName());
                    }
                    if (studentRequest.getPhone() != null) {
                        existingStudent.setPhone(studentRequest.getPhone());
                    }
                    if (studentRequest.getEmail() != null) {
                        existingStudent.setEmail(studentRequest.getEmail());
                    }
                    if (studentRequest.getTotalFees() != null) {
                        existingStudent.setTotalFees(studentRequest.getTotalFees());
                        // Recalculate remaining amount
                        BigDecimal newRemaining = studentRequest.getTotalFees()
                                .subtract(existingStudent.getPaidAmount());
                        existingStudent.setRemainingAmount(newRemaining);
                    }

                    Student updatedStudent = studentRepository.save(existingStudent);
                    return studentMapper.toStudentResponse(updatedStudent);
                });
    }

    @Override
    public InstallmentPlan calculateInstallments(Long studentId) {
        if (Objects.isNull(studentId)) {
            throw new IllegalArgumentException("StudentId is null");
        }

        // Get student and roundDiploma
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        RoundDiploma rd = student.getRoundDiploma();

        // Use the individual installment dates and amounts from RoundDiploma
        List<InstallmentPlan.Installment> installments = new ArrayList<>();
        LocalDate[] dueDates = {
            rd.getInstallment1Date(),
            rd.getInstallment2Date(),
            rd.getInstallment3Date(),
            rd.getInstallment4Date()
        };
        
        BigDecimal[] installmentAmounts = {
            rd.getInstallment1Amount(),
            rd.getInstallment2Amount(),
            rd.getInstallment3Amount(),
            rd.getInstallment4Amount()
        };
        
        // Get all payments for this student
        List<Payment> payments = paymentRepository.findByStudent(student);

        for (int i = 0; i < 4; i++) {
            final int installmentNumber = i + 1;
            Optional<Payment> installmentPayment = payments.stream()
                    .filter(p -> p.getInstallmentNumber() != null && p.getInstallmentNumber() == installmentNumber)
                    .findFirst();

            boolean isPaid = installmentPayment.isPresent();
            LocalDateTime paidDate = installmentPayment.map(Payment::getPaymentDate).orElse(null);

            installments.add(InstallmentPlan.Installment.builder()
                    .installmentNumber(installmentNumber)
                    .amount(installmentAmounts[i] != null ? installmentAmounts[i] : BigDecimal.ZERO)
                    .dueDate(dueDates[i])
                    .isPaid(isPaid)
                    .paidDate(paidDate)
                    .build());
        }

        return InstallmentPlan.builder()
                .studentId(student.getId())
                .studentName(student.getName())
                .totalFees(student.getTotalFees())
                .totalInstallments(4)
                .installments(installments)
                .build();
    }

    @Override
    public PaymentSummary getPaymentSummary(Long studentId) {
        if (Objects.isNull(studentId)) {
            throw new IllegalArgumentException("StudentId is null");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        // Get all payments for this student
        List<Payment> payments = paymentRepository.findByStudent(student);

        // Get recent payments (last 5)
        Pageable topFive = PageRequest.of(0, 5);
        List<Payment> recentPayments = paymentRepository.findRecentPaymentsByStudent(student, topFive);
        List<PaymentResponse> recentPaymentResponses = paymentMapper.toPaymentResponseList(recentPayments);

        // Get last payment date
        LocalDateTime lastPaymentDate = payments.stream()
                .map(Payment::getPaymentDate)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        return PaymentSummary.builder()
                .studentId(student.getId())
                .studentName(student.getName())
                .totalFees(student.getTotalFees())
                .paidAmount(student.getPaidAmount())
                .remainingAmount(student.getRemainingAmount())
                .paymentStatus(student.getPaymentStatus())
                .totalPayments(payments.size())
                .lastPaymentDate(lastPaymentDate)
                .recentPayments(recentPaymentResponses)
                .build();
    }

    @Override
    public List<StudentResponse> getStudentsWithOutstandingBalance() {
        List<Student> students = studentRepository.findStudentsWithOutstandingBalance();
        return studentMapper.toStudentResponseList(students);
    }
}
