package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Page<Attendance> findByEmployeeId(Long employeeId, Pageable pageable);

    Page<Attendance> findByDate(LocalDate date, Pageable pageable);

    Optional<Attendance> findByEmployeeIdAndDate(Long employeeId, LocalDate date);

    boolean existsByEmployeeIdAndDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate from, LocalDate to);

    Page<Attendance> findByEmployeeIdAndDateBetween(Long employeeId, LocalDate from, LocalDate to, Pageable pageable);

    Page<Attendance> findByDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    @Query("SELECT COALESCE(SUM(a.totalHours), 0) FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :from AND :to")
    BigDecimal sumTotalHoursByEmployeeAndDateRange(@Param("employeeId") Long employeeId,
                                                   @Param("from") LocalDate from,
                                                   @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.employee.id = :employeeId AND a.date BETWEEN :from AND :to")
    long countDaysByEmployeeAndDateRange(@Param("employeeId") Long employeeId,
                                         @Param("from") LocalDate from,
                                         @Param("to") LocalDate to);
}
