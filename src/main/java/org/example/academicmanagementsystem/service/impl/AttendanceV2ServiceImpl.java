package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.AttendanceV2Request;
import org.example.academicmanagementsystem.dto.AttendanceV2Response;
import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.example.academicmanagementsystem.model.StudentAttendanceV2;
import org.example.academicmanagementsystem.model.StudentV2;
import org.example.academicmanagementsystem.repository.RoundDiplomaV2Repository;
import org.example.academicmanagementsystem.repository.StudentAttendanceV2Repository;
import org.example.academicmanagementsystem.repository.StudentV2Repository;
import org.example.academicmanagementsystem.service.AttendanceV2Service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceV2ServiceImpl implements AttendanceV2Service {

    private final StudentAttendanceV2Repository attendanceRepository;
    private final RoundDiplomaV2Repository roundDiplomaRepository;
    private final StudentV2Repository studentRepository;

    @Override
    @Transactional
    public void saveBulkAttendance(AttendanceV2Request request) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(request.getRoundDiplomaId())
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));

        // Get existing records for this date to update instead of duplicate
        List<StudentAttendanceV2> existing = attendanceRepository.findByRoundDiplomaAndDate(rd, request.getDate());
        Map<Long, StudentAttendanceV2> existingMap = existing.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getId(), a -> a));

        for (AttendanceV2Request.StudentAttendanceRecord record : request.getRecords()) {
            StudentAttendanceV2 attendance = existingMap.get(record.getStudentId());
            if (attendance == null) {
                attendance = new StudentAttendanceV2();
                StudentV2 student = studentRepository.findById(record.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student not found: " + record.getStudentId()));
                attendance.setStudent(student);
                attendance.setRoundDiploma(rd);
                attendance.setDate(request.getDate());
            }
            attendance.setStatus(record.getStatus());
            attendance.setNotes(record.getNotes());
            attendanceRepository.save(attendance);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceV2Response> getAttendanceByDiplomaAndDate(Long roundDiplomaId, LocalDate date) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(roundDiplomaId)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));
        
        List<StudentAttendanceV2> attendanceList = attendanceRepository.findByRoundDiplomaAndDate(rd, date);
        return attendanceList.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private AttendanceV2Response mapToResponse(StudentAttendanceV2 a) {
        return AttendanceV2Response.builder()
                .id(a.getId())
                .studentId(a.getStudent().getId())
                .studentName(a.getStudent().getName())
                .roundDiplomaId(a.getRoundDiploma().getId())
                .date(a.getDate())
                .status(a.getStatus())
                .notes(a.getNotes())
                .build();
    }
}
