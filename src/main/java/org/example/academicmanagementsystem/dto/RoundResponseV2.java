package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoundResponseV2 {
    private Long id;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<DiplomaResponseV2> diplomas;
    private int totalDiplomas;
}
