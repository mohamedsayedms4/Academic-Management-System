package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesV2Response {
    private Long id;
    private String name;
    private String phone;
    private String username;
    private String password;
    private String role;
    private LocalDate joinDate;
    private Double commission;
    private Double salary;
    private String paymentMethod;
}
