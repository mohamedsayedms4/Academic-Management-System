package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InstallmentPlan {
    private Long studentId;
    private String studentName;
    private BigDecimal totalFees;
    private BigDecimal installmentAmount;
    private Integer totalInstallments;
    private List<Installment> installments;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Installment {
        private Integer installmentNumber;
        private BigDecimal amount;
        private LocalDate dueDate;
        private Boolean isPaid;
        private LocalDateTime paidDate;
    }
}
