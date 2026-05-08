package org.example.academicmanagementsystem.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "sales_v2")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SalesV2 extends BaseEntity {

    private String name;
    private String phone;
    private String username;
    private String password;
    private String role; // Moderator, Tele sales
    private LocalDate joinDate;
    private Double commission; // in %
    private Double salary;
    private String paymentMethod;
}
