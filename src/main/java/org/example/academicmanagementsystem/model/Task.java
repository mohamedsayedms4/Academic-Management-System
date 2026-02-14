package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Task extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "assigned_to_id", nullable = false)
    private User assignedTo;

    @ManyToOne
    @JoinColumn(name = "created_by_id", nullable = false)
    private User creator;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskStatus status = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TaskPriority priority;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    @Column(columnDefinition = "TEXT")
    private String completionNotes;

}
