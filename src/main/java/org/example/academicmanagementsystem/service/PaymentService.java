package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.PaymentRequest;
import org.example.academicmanagementsystem.dto.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface PaymentService {

    PaymentResponse recordPayment(PaymentRequest paymentRequest);

    Optional<PaymentResponse> findById(Long id);

    Page<PaymentResponse> getPaymentsByStudent(Long studentId, Pageable pageable);

    Optional<PaymentResponse> findByReceiptNumber(String receiptNumber);

    Map<String, Object> getPaymentStatistics();

    List<PaymentResponse> getPaymentsBetweenDates(LocalDateTime start, LocalDateTime end);
}
