package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "users")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password; // Hashed using BCrypt

    @Column(nullable = false)
    private String fullName;

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Column(nullable = false)
    private Boolean active = true;

    // Relations
    @OneToMany(mappedBy = "teleSales")
    private List<Lead> managedLeads;

    @OneToMany(mappedBy = "assignedTo")
    private List<Task> assignedTasks;

    @OneToMany(mappedBy = "employee")
    private List<Attendance> attendanceRecords;

    @OneToMany(mappedBy = "employee")
    private List<Salary> salaries;
}
