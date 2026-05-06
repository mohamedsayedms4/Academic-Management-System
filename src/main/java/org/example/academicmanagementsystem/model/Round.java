package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "rounds")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Round extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate; // Made optional to match frontend

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RoundDiploma> roundDiplomas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoundStatus status = RoundStatus.ACTIVE;

}
