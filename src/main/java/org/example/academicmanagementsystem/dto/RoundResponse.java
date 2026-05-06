package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.RoundStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundResponse {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private DiplomaResponse diploma;
    private Integer totalStudents;
    private Integer currentEnrollment;
    private BigDecimal installmentAmount;
    private RoundStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
