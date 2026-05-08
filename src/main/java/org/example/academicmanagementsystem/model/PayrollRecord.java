package org.example.academicmanagementsystem.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PayrollRecord extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String month; // Format: "YYYY-MM"

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPayroll;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();
}
