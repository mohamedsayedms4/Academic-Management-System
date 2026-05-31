package org.example.academicmanagementsystem.dto;

import lombok.Builder;
import lombok.Data;
import org.example.academicmanagementsystem.model.AttendanceStatus;

import java.time.LocalDate;

@Data
@Builder
public class AttendanceV2Response {
    private Long id;
    private Long studentId;
    private String studentName;
    private Long roundDiplomaId;
    private LocalDate date;
    private AttendanceStatus status;
    private Boolean taskSubmitted;
    private String studentPhone;
    private String notes;
}
