package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.AttendanceV2Request;
import org.example.academicmanagementsystem.dto.AttendanceV2Response;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceV2Service {
    void saveBulkAttendance(AttendanceV2Request request);
    List<AttendanceV2Response> getAttendanceByDiplomaAndDate(Long roundDiplomaId, LocalDate date);
}
