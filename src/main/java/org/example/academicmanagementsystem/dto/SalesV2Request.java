package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesV2Request {
    private String name;
    private String phone;
    private String username;
    private String password;
    private String role;
    private Double commission;
    private Double salary;
    private String paymentMethod;
}
