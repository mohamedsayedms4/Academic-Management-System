package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.StudentRequestV2;
import org.example.academicmanagementsystem.dto.StudentResponseV2;
import org.example.academicmanagementsystem.model.StudentStatus;
import org.example.academicmanagementsystem.service.StudentV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v2/students")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentV2Controller {

    private final StudentV2Service studentService;

    @PostMapping("/enroll")
    public ResponseEntity<StudentResponseV2> enrollStudent(@RequestBody StudentRequestV2 request) {
        return ResponseEntity.ok(studentService.enrollStudent(request));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<StudentResponseV2> cancelEnrollment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(studentService.cancelEnrollment(id, body.get("reason")));
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<StudentResponseV2> restoreEnrollment(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.restoreEnrollment(id));
    }

    @GetMapping("/future")
    public ResponseEntity<Page<StudentResponseV2>> getFutureEnrollments(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(studentService.getStudentsByStatus(StudentStatus.FUTURE_ENROLLMENT, pageable, search));
    }

    @GetMapping("/cancelled")
    public ResponseEntity<Page<StudentResponseV2>> getCancelledStudents(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(studentService.getStudentsByStatus(StudentStatus.CANCELLED, pageable, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponseV2> getStudent(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudent(id));
    }

    @GetMapping("/round-diploma/{id}")
    public ResponseEntity<Page<StudentResponseV2>> getStudentsByRoundDiploma(
            @PathVariable Long id,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(studentService.getStudentsByRoundDiploma(id, search, pageable));
    }

    @PutMapping("/{id}/postpone")
    public ResponseEntity<StudentResponseV2> postponeEnrollment(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(studentService.postponeEnrollment(id, body.get("targetRoundId")));
    }

    @PutMapping("/{id}/account-info")
    public ResponseEntity<StudentResponseV2> updateAccountInfo(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String password = body.containsKey("password") ? (String) body.get("password") : null;
        Boolean itStatus = body.containsKey("itStatus") ? (Boolean) body.get("itStatus") : null;
        StudentStatus status = body.containsKey("status") ? StudentStatus.valueOf((String) body.get("status")) : null;
        return ResponseEntity.ok(studentService.updateAccountInfo(id, password, itStatus, status));
    }
}
