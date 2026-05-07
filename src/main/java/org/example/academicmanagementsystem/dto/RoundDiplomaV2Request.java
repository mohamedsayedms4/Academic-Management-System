package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoundDiplomaV2Request {
    private Long roundId;
    private String diplomaName;
    private Long instructorId;
    private BigDecimal totalPrice;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalStudents;

    private Integer installment1Percent;
    private Integer installment2Percent;
    private Integer installment3Percent;
    private Integer installment4Percent;

    private BigDecimal installment1Amount;
    private BigDecimal installment2Amount;
    private BigDecimal installment3Amount;
    private BigDecimal installment4Amount;

    private LocalDate installment1Date;
    private LocalDate installment2Date;
    private LocalDate installment3Date;
    private LocalDate installment4Date;
}
