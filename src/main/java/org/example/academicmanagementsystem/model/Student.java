package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "students")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Student extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalFees;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime enrollmentDate;


    // Relations
    @OneToMany(mappedBy = "student")
    private List<Payment> payments;

    @OneToMany(mappedBy = "student")
    private List<Complaint> complaints;
}
