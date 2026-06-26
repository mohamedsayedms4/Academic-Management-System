package org.example.academicmanagementsystem.dto;

import lombok.Data;
import org.example.academicmanagementsystem.model.SalaryStatus;
import java.math.BigDecimal;

@Data
public class SalaryUpdateRequest {
    private BigDecimal bonuses;
    private BigDecimal deductions;
    private BigDecimal overtime;
    private BigDecimal paidAmount;
    private SalaryStatus status;
}
