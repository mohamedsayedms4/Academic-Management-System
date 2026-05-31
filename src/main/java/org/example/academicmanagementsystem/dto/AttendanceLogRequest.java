package org.example.academicmanagementsystem.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AttendanceLogRequest {
    private LocalDate date;
    private BigDecimal totalHours;
}
