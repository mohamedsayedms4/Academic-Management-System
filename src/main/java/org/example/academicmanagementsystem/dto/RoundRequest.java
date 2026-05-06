package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.RoundStatus;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundRequest {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate; // Optional
    private List<RoundDiplomaRequest> diplomas;
    private RoundStatus status;
}
