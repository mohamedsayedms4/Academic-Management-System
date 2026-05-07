package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.AttendanceV2Request;
import org.example.academicmanagementsystem.dto.AttendanceV2Response;
import org.example.academicmanagementsystem.service.AttendanceV2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v2/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceV2Controller {

    private final AttendanceV2Service attendanceService;

    @PostMapping("/bulk")
    public ResponseEntity<Void> saveBulkAttendance(@RequestBody AttendanceV2Request request) {
        attendanceService.saveBulkAttendance(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/diploma/{id}")
    public ResponseEntity<List<AttendanceV2Response>> getAttendance(
            @PathVariable Long id,
            @RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDiplomaAndDate(id, LocalDate.parse(date)));
    }
}
