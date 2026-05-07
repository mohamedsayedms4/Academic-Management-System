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
}
