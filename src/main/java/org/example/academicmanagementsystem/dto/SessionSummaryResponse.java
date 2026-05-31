package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionSummaryResponse {
    private LocalDate sessionDate;
    private String dayOfWeek;
    private long attendedCount;
    private long tasksSubmittedCount;
    private long totalStudentsCount;
}
