package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "rounds")
public class Round extends BaseEntity {

    @Column(nullable = false)
    private String name; // "الراوند الخامس - برمجة"

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String diplomaName;

    @Column(nullable = false)
    private Integer totalStudents; // السعة القصوى

    @Column(nullable = false)
    private Integer currentEnrollment = 0;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal installmentAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundStatus status = RoundStatus.ACTIVE;


    // Relations
    @OneToMany(mappedBy = "round")
    private List<Student> students;
}
