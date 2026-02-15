package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.LeadStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadResponse {
    private Long id;
    private String phoneNumber;
    private String diplomaName;
    private String moderatorNotes;
    private LeadStatus status;
    private String closureReason;
    private TeleSalesInfo teleSales; // Nested info about assigned telesales
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TeleSalesInfo {
        private Long id;
        private String username;
        private String fullName;
    }
}
