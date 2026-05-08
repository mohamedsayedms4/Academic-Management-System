package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private String title;
    private BigDecimal amount;
    private BigDecimal payed;
    private BigDecimal remaining;
    private String payMethod;
    private LocalDate date;
    private String note;
}
