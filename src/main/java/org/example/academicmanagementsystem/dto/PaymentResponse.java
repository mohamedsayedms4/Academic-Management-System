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
public class PaymentResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentType type;
    private PaymentMethod method;
    private String receiptNumber;
    private String notes;
    private Integer installmentNumber;
    private ProcessedByInfo processedBy;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProcessedByInfo {
        private Long id;
        private String username;
        private String fullName;
    }
}
