package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.PaymentRequest;
import org.example.academicmanagementsystem.dto.PaymentResponse;
import org.example.academicmanagementsystem.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // Record a payment - accessible by ADMIN, ACCOUNTANT
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<PaymentResponse> recordPayment(@RequestBody PaymentRequest paymentRequest) {
        PaymentResponse createdPayment = paymentService.recordPayment(paymentRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPayment);
    }

    // Get payment by ID - accessible by ADMIN, ACCOUNTANT
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable Long id) {
        return paymentService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get student's payment history - accessible by ADMIN, ACCOUNTANT, MODERATOR
    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'MODERATOR')")
    public ResponseEntity<Page<PaymentResponse>> getPaymentsByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("paymentDate").descending());
        Page<PaymentResponse> payments = paymentService.getPaymentsByStudent(studentId, pageable);

        return ResponseEntity.ok(payments);
    }

    // Find payment by receipt number - accessible by ADMIN, ACCOUNTANT
    @GetMapping("/receipt/{receiptNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<PaymentResponse> getPaymentByReceipt(@PathVariable String receiptNumber) {
        return paymentService.findByReceiptNumber(receiptNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Get payment statistics - accessible by ADMIN, ACCOUNTANT
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        Map<String, Object> statistics = paymentService.getPaymentStatistics();
        return ResponseEntity.ok(statistics);
    }

    // Get payments in date range - accessible by ADMIN, ACCOUNTANT
    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        List<PaymentResponse> payments = paymentService.getPaymentsBetweenDates(startDate, endDate);
        return ResponseEntity.ok(payments);
    }

    // Health check endpoint - public access
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = Map.of(
                "status", "UP",
                "service", "Payment Service");
        return ResponseEntity.ok(response);
    }
}
