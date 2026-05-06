package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundDiplomaRequest {
    private Long diplomaId;
    private Long instructorId;
    private BigDecimal totalPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalStudents;
    
    private BigDecimal installment1Amount;
    private BigDecimal installment2Amount;
    private BigDecimal installment3Amount;
    private BigDecimal installment4Amount;

    private LocalDate installment1Date;
    private LocalDate installment2Date;
    private LocalDate installment3Date;
    private LocalDate installment4Date;
}
