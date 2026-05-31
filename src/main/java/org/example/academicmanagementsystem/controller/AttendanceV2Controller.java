package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.academicmanagementsystem.dto.AttendanceV2Request;
import org.example.academicmanagementsystem.dto.AttendanceV2Response;
import org.example.academicmanagementsystem.service.AttendanceV2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v2/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AttendanceV2Controller {

    private final AttendanceV2Service attendanceService;

    @PostMapping("/bulk")
    public ResponseEntity<Void> saveBulkAttendance(@RequestBody AttendanceV2Request request) {
        log.info(">>> POST /api/v2/attendance/bulk - roundDiplomaId: {}, date: {}, records: {}",
                request.getRoundDiplomaId(), request.getDate(),
                request.getRecords() != null ? request.getRecords().size() : 0);
        attendanceService.saveBulkAttendance(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/diploma/{id}")
    public ResponseEntity<List<AttendanceV2Response>> getAttendance(
            @PathVariable Long id,
            @RequestParam String date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByDiplomaAndDate(id, LocalDate.parse(date)));
    }

    @GetMapping("/diploma/{id}/sessions")
    public ResponseEntity<List<org.example.academicmanagementsystem.dto.SessionSummaryResponse>> getSessionsSummary(@PathVariable Long id) {
        return ResponseEntity.ok(attendanceService.getSessionsSummary(id));
    }
}
