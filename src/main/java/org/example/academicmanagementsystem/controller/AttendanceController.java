package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.AttendanceLogRequest;
import org.example.academicmanagementsystem.dto.AttendanceLogResponse;
import org.example.academicmanagementsystem.model.Attendance;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.repository.AttendanceRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class AttendanceController {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Current user not found: " + username));
    }

    // Submit or update work hours for a specific date
    @PostMapping
    public ResponseEntity<AttendanceLogResponse> logHours(@RequestBody AttendanceLogRequest request) {
        User user = getCurrentUser();
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        Optional<Attendance> existingOpt = attendanceRepository.findByEmployeeIdAndDate(user.getId(), date);
        Attendance attendance;
        if (existingOpt.isPresent()) {
            attendance = existingOpt.get();
            attendance.setTotalHours(request.getTotalHours());
        } else {
            attendance = new Attendance();
            attendance.setEmployee(user);
            attendance.setDate(date);
            attendance.setTotalHours(request.getTotalHours());
        }

        LocalDateTime checkIn = date.atTime(9, 0); // 9:00 AM standard
        LocalDateTime checkOut = checkIn.plusMinutes(request.getTotalHours().multiply(new BigDecimal("60")).longValue());
        attendance.setCheckInTime(checkIn);
        attendance.setCheckOutTime(checkOut);
        
        attendance.setCreatedBy(user.getUsername());
        attendance.setUpdatedBy(user.getUsername());

        Attendance saved = attendanceRepository.save(attendance);

        return ResponseEntity.ok(AttendanceLogResponse.builder()
                .id(saved.getId())
                .date(saved.getDate())
                .totalHours(saved.getTotalHours())
                .build());
    }

    // Get attendance logs of the current user (paginated, sorted by date descending)
    @GetMapping("/my-attendance")
    public ResponseEntity<Page<AttendanceLogResponse>> getMyAttendance(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        User user = getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by("date").descending());
        Page<AttendanceLogResponse> response = attendanceRepository.findByEmployeeId(user.getId(), pageable)
                .map(a -> AttendanceLogResponse.builder()
                        .id(a.getId())
                        .date(a.getDate())
                        .totalHours(a.getTotalHours())
                        .build());
        return ResponseEntity.ok(response);
    }

    // Update work hours for a specific log id
    @PutMapping("/{id}")
    public ResponseEntity<AttendanceLogResponse> updateHours(@PathVariable Long id, @RequestBody AttendanceLogRequest request) {
        User user = getCurrentUser();
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found: " + id));

        if (!attendance.getEmployee().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to modify this attendance record");
        }

        attendance.setTotalHours(request.getTotalHours());
        LocalDateTime checkIn = attendance.getDate().atTime(9, 0);
        LocalDateTime checkOut = checkIn.plusMinutes(request.getTotalHours().multiply(new BigDecimal("60")).longValue());
        attendance.setCheckInTime(checkIn);
        attendance.setCheckOutTime(checkOut);
        attendance.setUpdatedBy(user.getUsername());

        Attendance saved = attendanceRepository.save(attendance);

        return ResponseEntity.ok(AttendanceLogResponse.builder()
                .id(saved.getId())
                .date(saved.getDate())
                .totalHours(saved.getTotalHours())
                .build());
    }

    // Delete a work hour log
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteHours(@PathVariable Long id) {
        User user = getCurrentUser();
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Attendance record not found: " + id));

        if (!attendance.getEmployee().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this attendance record");
        }

        attendanceRepository.delete(attendance);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Attendance record deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Fetch accumulated hours for the current week (Sunday to Saturday)
    @GetMapping("/weekly-hours")
    public ResponseEntity<Map<String, java.math.BigDecimal>> getWeeklyHours() {
        User user = getCurrentUser();
        LocalDate today = LocalDate.now();
        int daysToSubtract = today.getDayOfWeek().getValue() % 7;
        LocalDate startOfWeek = today.minusDays(daysToSubtract);

        java.math.BigDecimal hours = attendanceRepository.sumTotalHoursByEmployeeAndDateRange(user.getId(), startOfWeek, today);
        if (hours == null) {
            hours = java.math.BigDecimal.ZERO;
        }

        Map<String, java.math.BigDecimal> response = new HashMap<>();
        response.put("weeklyHours", hours);
        return ResponseEntity.ok(response);
    }
}
