package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class InvoiceV2Request {
    private LocalDate invoiceDate;
    private String customerName;
    private String customerPhone;
    private BigDecimal amount;
    private String notes;
}
