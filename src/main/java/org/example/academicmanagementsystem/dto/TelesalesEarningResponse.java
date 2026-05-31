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
public class TelesalesEarningResponse {
    private Long id;
    private Long telesalesId;
    private String telesalesName;
    private String telesalesPhone;
    private Integer totalClients;
    private BigDecimal commissionAmount;
    private String status;
    private LocalDate paymentDate;
}
