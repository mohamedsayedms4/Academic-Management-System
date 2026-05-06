package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.PaymentMethod;
import org.example.academicmanagementsystem.model.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequest {
    private Long studentId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentType type;
    private PaymentMethod method;
    private String notes;
    private Integer installmentNumber;
}
