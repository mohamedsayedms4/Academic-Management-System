package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance")
public class Attendance extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalDateTime checkInTime;

    private LocalDateTime checkOutTime;

    @Column(precision = 5, scale = 2)
    private BigDecimal totalHours;


}
