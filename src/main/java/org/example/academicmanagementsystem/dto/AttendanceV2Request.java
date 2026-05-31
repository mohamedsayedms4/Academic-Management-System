package org.example.academicmanagementsystem.dto;

import lombok.Data;
import org.example.academicmanagementsystem.model.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

@Data
public class AttendanceV2Request {
    private Long roundDiplomaId;
    private LocalDate date;
    private List<StudentAttendanceRecord> records;

    @Data
    public static class StudentAttendanceRecord {
        private Long studentId;
        private AttendanceStatus status;
        private Boolean taskSubmitted;
        private String notes;
    }
}
