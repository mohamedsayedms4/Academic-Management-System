package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "instructors_v2")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class InstructorV2 extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String phoneNumber;

    private Double salary;

    private String paymentMethod;

    @ManyToMany
    @JoinTable(
        name = "instructor_v2_diplomas",
        joinColumns = @JoinColumn(name = "instructor_v2_id"),
        inverseJoinColumns = @JoinColumn(name = "diploma_v2_id")
    )
    private Set<DiplomaV2> assignedDiplomas = new HashSet<>();
}
