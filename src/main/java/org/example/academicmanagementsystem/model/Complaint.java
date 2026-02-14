package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Complaint extends BaseEntity{

    @ManyToOne
    @JoinColumn(name = "student_id")
    private Student student;

    @Column(nullable = false)
    private String studentName;

    @Column(nullable = false)
    private String phone;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String complaintText;

    @Column(columnDefinition = "TEXT")
    private String responseText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ComplaintStatus status = ComplaintStatus.OPEN;

    @Column(unique = true, nullable = false)
    private String ticketNumber; // COMP-2026-001

    @ManyToOne
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;


    private LocalDateTime resolvedAt;
}
