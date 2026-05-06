package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.StudentStatus;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentRequestV2 {
    private String name;
    private String phone;
    private String email;
    private String notes;
    private Long roundId;
    private Long diplomaId;
    private BigDecimal depositAmount;
    private Long salesPersonId;
    private String discount;
    private StudentStatus status;
    private String cancellationReason;
}
