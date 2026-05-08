package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.EarningsStatus;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesEarningsV2Response {
    private Long id;
    private String salesName;
    private Integer totalClients;
    private Double commissionAmount;
    private EarningsStatus status;
    private LocalDate paymentDate;
}
