package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.StudentRequestV2;
import org.example.academicmanagementsystem.dto.StudentResponseV2;
import org.example.academicmanagementsystem.model.*;
import org.example.academicmanagementsystem.repository.*;
import org.example.academicmanagementsystem.service.StudentV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StudentV2ServiceImpl implements StudentV2Service {

    private final StudentV2Repository studentRepository;
    private final RoundV2Repository roundRepository;
    private final DiplomaV2Repository diplomaRepository;
    private final UserRepository userRepository;
    private final RoundDiplomaV2Repository roundDiplomaRepository;
    private final org.example.academicmanagementsystem.service.NotificationService notificationService;

    @Override
    @Transactional
    public StudentResponseV2 enrollStudent(StudentRequestV2 request) {
        StudentV2 student = new StudentV2();
        student.setName(request.getName());
        student.setPhone(request.getPhone());
        student.setEmail(request.getEmail());
        student.setNotes(request.getNotes());
        student.setDepositAmount(request.getDepositAmount());
        student.setDiscount(request.getDiscount());
        student.setStatus(StudentStatus.FUTURE_ENROLLMENT);

        if (request.getRoundId() != null) {
            student.setRound(roundRepository.findById(request.getRoundId()).orElse(null));
        }
        if (request.getDiplomaId() != null) {
            student.setDiploma(diplomaRepository.findById(request.getDiplomaId()).orElse(null));
        }
        if (request.getSalesPersonId() != null) {
            student.setSalesPerson(userRepository.findById(request.getSalesPersonId()).orElse(null));
        }

        StudentV2 savedStudent = studentRepository.save(student);

        notificationService.createForRole(UserRole.ADMIN, NotificationType.STUDENT_ADDED, "New student enrolled: " + savedStudent.getName(), savedStudent.getId());
        notificationService.createForRole(UserRole.MODERATOR, NotificationType.STUDENT_ADDED, "New student enrolled: " + savedStudent.getName(), savedStudent.getId());

        return mapToResponse(savedStudent);
    }

    @Override
    @Transactional
    public StudentResponseV2 cancelEnrollment(Long id, String reason) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(StudentStatus.CANCELLED);
        student.setCancellationDate(LocalDate.now());
        student.setCancellationReason(reason);
        
        StudentV2 savedStudent = studentRepository.save(student);

        notificationService.createForRole(UserRole.ADMIN, NotificationType.STUDENT_ADDED, "Student enrollment cancelled: " + savedStudent.getName() + " (Reason: " + reason + ")", savedStudent.getId());
        notificationService.createForRole(UserRole.MODERATOR, NotificationType.STUDENT_ADDED, "Student enrollment cancelled: " + savedStudent.getName() + " (Reason: " + reason + ")", savedStudent.getId());

        return mapToResponse(savedStudent);
    }

    @Override
    @Transactional
    public StudentResponseV2 restoreEnrollment(Long id) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(StudentStatus.FUTURE_ENROLLMENT);
        student.setCancellationDate(null);
        student.setCancellationReason(null);
        return mapToResponse(studentRepository.save(student));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponseV2> getStudentsByStatus(StudentStatus status, Pageable pageable, String search) {
        Page<StudentV2> students;
        if (search != null && !search.isEmpty()) {
            students = studentRepository.findByStatusAndNameContainingIgnoreCase(status, search, pageable);
        } else {
            students = studentRepository.findByStatus(status, pageable);
        }
        return students.map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponseV2 getStudent(Long id) {
        return studentRepository.findById(id)
                .map(this::mapToResponse)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentResponseV2> getStudentsByRoundDiploma(Long roundDiplomaId, String search, Pageable pageable) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(roundDiplomaId)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));
        
        Page<StudentV2> students;
        if (search != null && !search.isEmpty()) {
            students = studentRepository.searchInRoundDiploma(rd.getRound(), rd.getDiploma(), search, pageable);
        } else {
            students = studentRepository.findByRoundAndDiploma(rd.getRound(), rd.getDiploma(), pageable);
        }
        return students.map(this::mapToResponse);
    }

    @Override
    @Transactional
    public StudentResponseV2 postponeEnrollment(Long id, Long targetRoundId) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        RoundV2 targetRound = roundRepository.findById(targetRoundId)
                .orElseThrow(() -> new RuntimeException("Target round not found"));
        
        student.setRound(targetRound);
        student.setStatus(StudentStatus.POSTPONED);
        return mapToResponse(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponseV2 updateAccountInfo(Long id, String password, Boolean itStatus, StudentStatus status) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (password != null) student.setPassword(password);
        if (itStatus != null) student.setItStatus(itStatus);
        if (status != null) student.setStatus(status);
        return mapToResponse(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponseV2 updateStudent(Long id, StudentRequestV2 request) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setName(request.getName());
        student.setPhone(request.getPhone());
        student.setEmail(request.getEmail());
        student.setNotes(request.getNotes());
        student.setDepositAmount(request.getDepositAmount());
        student.setDiscount(request.getDiscount());

        if (request.getRoundId() != null) {
            student.setRound(roundRepository.findById(request.getRoundId()).orElse(null));
        }
        if (request.getDiplomaId() != null) {
            student.setDiploma(diplomaRepository.findById(request.getDiplomaId()).orElse(null));
        }
        if (request.getSalesPersonId() != null) {
            student.setSalesPerson(userRepository.findById(request.getSalesPersonId()).orElse(null));
        }

        return mapToResponse(studentRepository.save(student));
    }

    @Override
    @Transactional
    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("Student not found");
        }
        studentRepository.deleteById(id);
    }

    private StudentResponseV2 mapToResponse(StudentV2 student) {
        BigDecimal totalAmount = BigDecimal.ZERO;
        LocalDate startDate = null;
        LocalDate endDate = null;
        BigDecimal inst1Amt = BigDecimal.ZERO;
        LocalDate inst1Date = null;
        BigDecimal inst2Amt = BigDecimal.ZERO;
        LocalDate inst2Date = null;
        BigDecimal inst3Amt = BigDecimal.ZERO;
        LocalDate inst3Date = null;
        BigDecimal inst4Amt = BigDecimal.ZERO;
        LocalDate inst4Date = null;

        if (student.getRound() != null && student.getDiploma() != null) {
            java.util.Optional<RoundDiplomaV2> rdOpt = roundDiplomaRepository.findByRoundAndDiploma(student.getRound(), student.getDiploma());
            if (rdOpt.isPresent()) {
                RoundDiplomaV2 rd = rdOpt.get();
                totalAmount = rd.getTotalPrice() != null ? rd.getTotalPrice() : BigDecimal.ZERO;
                startDate = rd.getStartDate();
                endDate = rd.getEndDate();
                inst1Amt = rd.getInstallment1Amount() != null ? rd.getInstallment1Amount() : BigDecimal.ZERO;
                inst1Date = rd.getInstallment1Date();
                inst2Amt = rd.getInstallment2Amount() != null ? rd.getInstallment2Amount() : BigDecimal.ZERO;
                inst2Date = rd.getInstallment2Date();
                inst3Amt = rd.getInstallment3Amount() != null ? rd.getInstallment3Amount() : BigDecimal.ZERO;
                inst3Date = rd.getInstallment3Date();
                inst4Amt = rd.getInstallment4Amount() != null ? rd.getInstallment4Amount() : BigDecimal.ZERO;
                inst4Date = rd.getInstallment4Date();
            }
        }

        BigDecimal deposit = student.getDepositAmount() != null ? student.getDepositAmount() : BigDecimal.ZERO;
        BigDecimal inst1Paid = student.getInstallment1Paid() != null ? student.getInstallment1Paid() : BigDecimal.ZERO;
        BigDecimal inst2Paid = student.getInstallment2Paid() != null ? student.getInstallment2Paid() : BigDecimal.ZERO;
        BigDecimal inst3Paid = student.getInstallment3Paid() != null ? student.getInstallment3Paid() : BigDecimal.ZERO;
        BigDecimal inst4Paid = student.getInstallment4Paid() != null ? student.getInstallment4Paid() : BigDecimal.ZERO;
        BigDecimal totalPaid = deposit.add(inst1Paid).add(inst2Paid).add(inst3Paid).add(inst4Paid);
        BigDecimal remainingAmount = totalAmount.subtract(totalPaid);

        return StudentResponseV2.builder()
                .id(student.getId())
                .name(student.getName())
                .phone(student.getPhone())
                .email(student.getEmail())
                .notes(student.getNotes())
                .roundName(student.getRound() != null ? student.getRound().getName() : "N/A")
                .diplomaName(student.getDiploma() != null ? student.getDiploma().getName() : "N/A")
                .depositAmount(student.getDepositAmount())
                .salesPersonName(student.getSalesPerson() != null ? student.getSalesPerson().getFullName() : "N/A")
                .discount(student.getDiscount())
                .password(student.getPassword())
                .itStatus(student.getItStatus())
                .status(student.getStatus())
                .cancellationDate(student.getCancellationDate())
                .cancellationReason(student.getCancellationReason())
                .enrollmentDate(student.getEnrollmentDate())
                .totalAmount(totalAmount)
                .paidAmount(totalPaid)
                .remainingAmount(remainingAmount)
                .endDate(endDate)
                .installment1Paid(student.getInstallment1Paid())
                .installment1Notes(student.getInstallment1Notes())
                .installment2Paid(student.getInstallment2Paid())
                .installment2Notes(student.getInstallment2Notes())
                .installment3Paid(student.getInstallment3Paid())
                .installment3Notes(student.getInstallment3Notes())
                .installment4Paid(student.getInstallment4Paid())
                .installment4Notes(student.getInstallment4Notes())
                .installment1Date(inst1Date)
                .installment1Amount(inst1Amt)
                .installment2Date(inst2Date)
                .installment2Amount(inst2Amt)
                .installment3Date(inst3Date)
                .installment3Amount(inst3Amt)
                .installment4Date(inst4Date)
                .installment4Amount(inst4Amt)
                .build();
    }
}
