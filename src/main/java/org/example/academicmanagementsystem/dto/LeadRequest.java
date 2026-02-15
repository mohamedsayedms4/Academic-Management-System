package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.LeadStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadRequest {
    private String phoneNumber;
    private String diplomaName;
    private String moderatorNotes;
    private LeadStatus status;
    private String closureReason;
    private Long teleSalesId; // Optional: Only for ADMIN/MODERATOR to assign specific telesales
}
