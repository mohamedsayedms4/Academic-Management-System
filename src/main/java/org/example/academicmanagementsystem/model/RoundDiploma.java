package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "round_diplomas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RoundDiploma extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diploma_id", nullable = false)
    private Diploma diploma;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id")
    private User instructor;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer totalStudents;

    @Column(nullable = false)
    private Integer currentEnrollment = 0;

    // Individual Installment Amounts
    @Column(precision = 10, scale = 2)
    private BigDecimal installment1Amount;
    @Column(precision = 10, scale = 2)
    private BigDecimal installment2Amount;
    @Column(precision = 10, scale = 2)
    private BigDecimal installment3Amount;
    @Column(precision = 10, scale = 2)
    private BigDecimal installment4Amount;

    // Individual Installment Dates
    private LocalDate installment1Date;
    private LocalDate installment2Date;
    private LocalDate installment3Date;
    private LocalDate installment4Date;

    @OneToMany(mappedBy = "roundDiploma", cascade = CascadeType.ALL)
    private List<Student> students;
}
