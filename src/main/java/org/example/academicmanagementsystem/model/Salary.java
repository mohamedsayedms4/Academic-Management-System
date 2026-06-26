package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salaries")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Salary extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private User employee;

    @Column(nullable = false)
    private String month; // Format: "YYYY-MM"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal baseSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal bonuses = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal deductions = BigDecimal.ZERO;

    @Column(precision = 10, scale = 2)
    private BigDecimal overtime = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal netSalary;

    @Column(precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SalaryStatus status = SalaryStatus.PENDING;

    @ManyToOne
    @JoinColumn(name = "processed_by_id")
    @org.hibernate.annotations.NotFound(action = org.hibernate.annotations.NotFoundAction.IGNORE)
    private User processedBy;

    private LocalDateTime processedAt;

}
