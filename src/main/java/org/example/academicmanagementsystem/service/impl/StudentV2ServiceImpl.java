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

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StudentV2ServiceImpl implements StudentV2Service {

    private final StudentV2Repository studentRepository;
    private final RoundV2Repository roundRepository;
    private final DiplomaV2Repository diplomaRepository;
    private final UserRepository userRepository;

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
            student.setSalesPerson(userRepository.findById(request.getSalesPersonId().intValue()).orElse(null));
        }

        return mapToResponse(studentRepository.save(student));
    }

    @Override
    @Transactional
    public StudentResponseV2 cancelEnrollment(Long id, String reason) {
        StudentV2 student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setStatus(StudentStatus.CANCELLED);
        student.setCancellationDate(LocalDate.now());
        student.setCancellationReason(reason);
        return mapToResponse(studentRepository.save(student));
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

    private StudentResponseV2 mapToResponse(StudentV2 student) {
        return StudentResponseV2.builder()
                .id(student.getId())
                .name(student.getName())
                .phone(student.getPhone())
                .email(student.getEmail())
                .notes(student.getNotes())
                .roundName(student.getRound() != null ? student.getRound().getName() : "N/A")
                .diplomaName(student.getDiploma() != null ? student.getDiploma().getName() : "N/A")
                .depositAmount(student.getDepositAmount())
                .salesPersonName(student.getSalesPerson() != null ? student.getSalesPerson().getName() : "N/A")
                .discount(student.getDiscount())
                .status(student.getStatus())
                .cancellationDate(student.getCancellationDate())
                .cancellationReason(student.getCancellationReason())
                .enrollmentDate(student.getEnrollmentDate())
                .build();
    }
}
