package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "follow_ups")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class FollowUp extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "lead_id", nullable = false)
    private Lead lead;

    @Column(nullable = false)
    private Integer sequence; // 1, 2, 3...

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

}
