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
public class RoundRequestV2 {
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<Long> diplomaIds;
}
