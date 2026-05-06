package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class InstructorRequestV2 {
    private String name;
    private String phoneNumber;
    private Double salary;
    private String paymentMethod;
    private List<Long> assignedDiplomaIds;
}
