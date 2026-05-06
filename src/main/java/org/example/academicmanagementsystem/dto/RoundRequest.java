package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.RoundStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long diplomaId;
    private Integer totalStudents;
    private Integer currentEnrollment;
    private BigDecimal installmentAmount;
    private RoundStatus status;
}
