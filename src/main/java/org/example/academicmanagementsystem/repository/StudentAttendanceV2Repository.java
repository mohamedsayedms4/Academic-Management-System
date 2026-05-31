package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.example.academicmanagementsystem.model.StudentAttendanceV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudentAttendanceV2Repository extends JpaRepository<StudentAttendanceV2, Long> {
    List<StudentAttendanceV2> findByRoundDiplomaAndDate(RoundDiplomaV2 roundDiploma, LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT new org.example.academicmanagementsystem.dto.SessionSummaryResponse(" +
           "a.date, '', " +
           "SUM(CASE WHEN a.status = org.example.academicmanagementsystem.model.AttendanceStatus.PRESENT THEN 1L ELSE 0L END), " +
           "SUM(CASE WHEN a.taskSubmitted = true THEN 1L ELSE 0L END), " +
           "COUNT(a.id)) " +
           "FROM StudentAttendanceV2 a " +
           "WHERE a.roundDiploma.id = :roundDiplomaId " +
           "GROUP BY a.date " +
           "ORDER BY a.date ASC")
    List<org.example.academicmanagementsystem.dto.SessionSummaryResponse> getSessionsSummary(@org.springframework.data.repository.query.Param("roundDiplomaId") Long roundDiplomaId);
}
