package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.SalaryStatus;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryResponse {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String role;
    private String employmentType;
    private String phone;
    private BigDecimal salary;
    private BigDecimal bonus;
    private BigDecimal overtime;
    private BigDecimal total;
    private String payMethod;
    private BigDecimal payed;
    private BigDecimal remaining;
    private SalaryStatus status;
}
