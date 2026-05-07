package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceV2Response {
    private Long id;
    private LocalDate invoiceDate;
    private String customerName;
    private String customerPhone;
    private BigDecimal amount;
    private String notes;
    private LocalDateTime createdAt;
}
