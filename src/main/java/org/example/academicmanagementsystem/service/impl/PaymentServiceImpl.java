package org.example.academicmanagementsystem.service.impl;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.PaymentRequest;
import org.example.academicmanagementsystem.dto.PaymentResponse;
import org.example.academicmanagementsystem.mapper.PaymentMapper;
import org.example.academicmanagementsystem.model.*;
import org.example.academicmanagementsystem.repository.PaymentRepository;
import org.example.academicmanagementsystem.repository.StudentRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.service.PaymentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final org.example.academicmanagementsystem.service.NotificationService notificationService;

    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest paymentRequest) {
        if (Objects.isNull(paymentRequest)) {
            throw new IllegalArgumentException("PaymentRequest is null");
        }

        // Validate and get student
        Student student = studentRepository.findById(paymentRequest.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + paymentRequest.getStudentId()));

        // Validate payment amount
        if (paymentRequest.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        // Create payment entity
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(paymentRequest.getAmount());
        payment.setPaymentDate(
                paymentRequest.getPaymentDate() != null ? paymentRequest.getPaymentDate() : LocalDateTime.now());
        payment.setType(paymentRequest.getType());
        payment.setMethod(paymentRequest.getMethod());
        payment.setNotes(paymentRequest.getNotes());
        payment.setInstallmentNumber(paymentRequest.getInstallmentNumber());
        payment.setReceiptNumber(generateReceiptNumber());

        // Set processedBy to current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Current user not found: " + username));
            payment.setProcessedBy(currentUser);
        }

        // Update student's payment information
        BigDecimal newPaidAmount = student.getPaidAmount().add(paymentRequest.getAmount());
        BigDecimal newRemainingAmount = student.getTotalFees().subtract(newPaidAmount);

        student.setPaidAmount(newPaidAmount);
        student.setRemainingAmount(newRemainingAmount);

        // Update payment status based on amounts
        if (newPaidAmount.compareTo(BigDecimal.ZERO) == 0) {
            student.setPaymentStatus(PaymentStatus.PENDING);
        } else if (newPaidAmount.compareTo(student.getTotalFees()) >= 0) {
            student.setPaymentStatus(PaymentStatus.PAID);
        } else {
            student.setPaymentStatus(PaymentStatus.PARTIAL);
        }

        // Save payment and student
        Payment savedPayment = paymentRepository.save(payment);
        studentRepository.save(student);

        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.ADMIN, org.example.academicmanagementsystem.model.NotificationType.PAYMENT_RECEIVED, "Payment of " + savedPayment.getAmount() + " received from student " + student.getName(), savedPayment.getId());
        notificationService.createForRole(org.example.academicmanagementsystem.model.UserRole.ACCOUNTANT, org.example.academicmanagementsystem.model.NotificationType.PAYMENT_RECEIVED, "Payment of " + savedPayment.getAmount() + " received from student " + student.getName(), savedPayment.getId());

        return paymentMapper.toPaymentResponse(savedPayment);
    }

    @Override
    public Optional<PaymentResponse> findById(Long id) {
        if (Objects.isNull(id)) {
            throw new IllegalArgumentException("ID is null");
        }

        return paymentRepository.findById(id)
                .map(paymentMapper::toPaymentResponse);
    }

    @Override
    public Page<PaymentResponse> getPaymentsByStudent(Long studentId, Pageable pageable) {
        if (Objects.isNull(studentId) || Objects.isNull(pageable)) {
            throw new IllegalArgumentException("StudentId or Pageable is null");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        return paymentRepository.findByStudent(student, pageable)
                .map(paymentMapper::toPaymentResponse);
    }

    @Override
    public Optional<PaymentResponse> findByReceiptNumber(String receiptNumber) {
        if (Objects.isNull(receiptNumber) || receiptNumber.isEmpty()) {
            throw new IllegalArgumentException("Receipt number is null or empty");
        }

        return paymentRepository.findByReceiptNumber(receiptNumber)
                .map(paymentMapper::toPaymentResponse);
    }

    @Override
    public Map<String, Object> getPaymentStatistics() {
        Map<String, Object> statistics = new HashMap<>();

        List<Payment> allPayments = paymentRepository.findAll();

        BigDecimal totalCollected = allPayments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalPayments = allPayments.size();

        long cashPayments = allPayments.stream()
                .filter(p -> p.getMethod() == PaymentMethod.CASH)
                .count();

        long bankTransferPayments = allPayments.stream()
                .filter(p -> p.getMethod() == PaymentMethod.BANK_TRANSFER)
                .count();

        long cardPayments = allPayments.stream()
                .filter(p -> p.getMethod() == PaymentMethod.CARD)
                .count();

        statistics.put("totalCollected", totalCollected);
        statistics.put("totalPayments", totalPayments);
        statistics.put("cashPayments", cashPayments);
        statistics.put("bankTransferPayments", bankTransferPayments);
        statistics.put("cardPayments", cardPayments);

        return statistics;
    }

    @Override
    public List<PaymentResponse> getPaymentsBetweenDates(LocalDateTime start, LocalDateTime end) {
        if (Objects.isNull(start) || Objects.isNull(end)) {
            throw new IllegalArgumentException("Start or End date is null");
        }

        List<Payment> payments = paymentRepository.findPaymentsBetweenDates(start, end);
        return paymentMapper.toPaymentResponseList(payments);
    }

    /**
     * Generates a unique receipt number in format: RCP-YYYY-NNN
     * Example: RCP-2026-001
     */
    private String generateReceiptNumber() {
        int currentYear = Year.now().getValue();
        String prefix = "RCP-" + currentYear + "-";

        // Get the count of payments this year to generate sequential number
        LocalDateTime yearStart = LocalDateTime.of(currentYear, 1, 1, 0, 0);
        LocalDateTime yearEnd = LocalDateTime.of(currentYear, 12, 31, 23, 59);

        long paymentsThisYear = paymentRepository.findPaymentsBetweenDates(yearStart, yearEnd).size();

        // Generate sequential number with padding (001, 002, etc.)
        String sequentialNumber = String.format("%03d", paymentsThisYear + 1);

        return prefix + sequentialNumber;
    }
}
