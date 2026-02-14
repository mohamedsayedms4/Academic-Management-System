package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
public class Payment extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime paymentDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod method;

    @Column(unique = true, nullable = false)
    private String receiptNumber; // RCP-2026-001

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "processed_by")
    private User processedBy;


}
