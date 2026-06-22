package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "students_v2")
@SQLDelete(sql = "UPDATE students_v2 SET deleted = true WHERE id=?")
@SQLRestriction("deleted = false")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class StudentV2 extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne
    @JoinColumn(name = "round_id")
    private RoundV2 round;

    @ManyToOne
    @JoinColumn(name = "diploma_id")
    private DiplomaV2 diploma;

    private BigDecimal depositAmount = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "sales_person_id")
    private User salesPerson;

    private String discount;

    private String password;

    private Boolean itStatus = false;

    @Enumerated(EnumType.STRING)
    private StudentStatus status = StudentStatus.FUTURE_ENROLLMENT;

    private LocalDate cancellationDate;

    @Column(columnDefinition = "TEXT")
    private String cancellationReason;

    private LocalDateTime enrollmentDate = LocalDateTime.now();

    private BigDecimal installment1Paid = BigDecimal.ZERO;
    private String installment1Notes;

    private BigDecimal installment2Paid = BigDecimal.ZERO;
    private String installment2Notes;

    private BigDecimal installment3Paid = BigDecimal.ZERO;
    private String installment3Notes;

    private BigDecimal installment4Paid = BigDecimal.ZERO;
    private String installment4Notes;
}
