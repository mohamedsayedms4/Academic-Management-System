package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.InstallmentPlan;
import org.example.academicmanagementsystem.dto.PaymentSummary;
import org.example.academicmanagementsystem.dto.StudentRequest;
import org.example.academicmanagementsystem.dto.StudentResponse;
import org.example.academicmanagementsystem.service.StudentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    // Enroll a new student - accessible by ADMIN, MODERATOR
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<StudentResponse> enrollStudent(@RequestBody StudentRequest studentRequest) {
        StudentResponse enrolledStudent = studentService.enrollStudent(studentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(enrolledStudent);
    }

    // Get all students with pagination - accessible by all authenticated users
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StudentResponse>> getAllStudents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<StudentResponse> students = studentService.findAll(pageable);
        return ResponseEntity.ok(students);
    }

    // Get student by ID - accessible by ADMIN, MODERATOR, ACCOUNTANT
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR', 'ACCOUNTANT')")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        return studentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Update student - accessible by ADMIN, MODERATOR
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @RequestBody StudentRequest studentRequest) {
        return studentService.update(id, studentRequest)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get students by round - accessible by all authenticated users
    @GetMapping("/round/{roundId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Page<StudentResponse>> getStudentsByRound(
            @PathVariable Long roundId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("enrollmentDate").descending());
        Page<StudentResponse> students = studentService.getStudentsByRound(roundId, pageable);

        return ResponseEntity.ok(students);
    }

    // Calculate installment plan for student - accessible by ADMIN, ACCOUNTANT,
    // MODERATOR
    @GetMapping("/{id}/installments")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'MODERATOR')")
    public ResponseEntity<InstallmentPlan> calculateInstallments(@PathVariable Long id) {
        InstallmentPlan plan = studentService.calculateInstallments(id);
        return ResponseEntity.ok(plan);
    }

    // Get payment summary for student - accessible by ADMIN, ACCOUNTANT, MODERATOR
    @GetMapping("/{id}/payment-summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'MODERATOR')")
    public ResponseEntity<PaymentSummary> getPaymentSummary(@PathVariable Long id) {
        PaymentSummary summary = studentService.getPaymentSummary(id);
        return ResponseEntity.ok(summary);
    }

    // Get students with outstanding balance - accessible by ADMIN, ACCOUNTANT
    @GetMapping("/outstanding-balance")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<StudentResponse>> getStudentsWithOutstandingBalance() {
        List<StudentResponse> students = studentService.getStudentsWithOutstandingBalance();
        return ResponseEntity.ok(students);
    }

    // Health check endpoint - public access
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = Map.of(
                "status", "UP",
                "service", "Student Service");
        return ResponseEntity.ok(response);
    }
}
