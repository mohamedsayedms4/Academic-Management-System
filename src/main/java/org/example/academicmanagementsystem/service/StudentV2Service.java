package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.StudentRequestV2;
import org.example.academicmanagementsystem.dto.StudentResponseV2;
import org.example.academicmanagementsystem.model.StudentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StudentV2Service {
    StudentResponseV2 enrollStudent(StudentRequestV2 request);
    StudentResponseV2 cancelEnrollment(Long id, String reason);
    StudentResponseV2 restoreEnrollment(Long id);
    Page<StudentResponseV2> getStudentsByStatus(StudentStatus status, Pageable pageable, String search);
    StudentResponseV2 getStudent(Long id);
    Page<StudentResponseV2> getStudentsByRoundDiploma(Long roundDiplomaId, String search, Pageable pageable);
    StudentResponseV2 postponeEnrollment(Long id, Long targetRoundId);
    StudentResponseV2 updateAccountInfo(Long id, String password, Boolean itStatus);
}
