package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.Set;

@Entity
@Table(name = "rounds_v2")
@SQLDelete(sql = "UPDATE rounds_v2 SET deleted = true WHERE id=?")
@SQLRestriction("deleted = false")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class RoundV2 extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    @ManyToMany
    @JoinTable(
        name = "round_v2_diplomas",
        joinColumns = @JoinColumn(name = "round_v2_id"),
        inverseJoinColumns = @JoinColumn(name = "diploma_v2_id")
    )
    private Set<DiplomaV2> diplomas;
}
