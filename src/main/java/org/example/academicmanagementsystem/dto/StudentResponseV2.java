package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.StudentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentResponseV2 {
    private Long id;
    private String name;
    private String phone;
    private String email;
    private String notes;
    private String roundName;
    private String diplomaName;
    private BigDecimal depositAmount;
    private String salesPersonName;
    private String discount;
    private String password;
    private Boolean itStatus;
    private StudentStatus status;
    private LocalDate cancellationDate;
    private String cancellationReason;
    private LocalDateTime enrollmentDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private LocalDate endDate;

    private BigDecimal installment1Paid;
    private String installment1Notes;
    private BigDecimal installment2Paid;
    private String installment2Notes;
    private BigDecimal installment3Paid;
    private String installment3Notes;
    private BigDecimal installment4Paid;
    private String installment4Notes;

    private LocalDate installment1Date;
    private BigDecimal installment1Amount;
    private LocalDate installment2Date;
    private BigDecimal installment2Amount;
    private LocalDate installment3Date;
    private BigDecimal installment3Amount;
    private LocalDate installment4Date;
    private BigDecimal installment4Amount;
}
