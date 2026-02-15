package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.academicmanagementsystem.model.LeadStatus;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeadDetailResponse {
    private Long id;
    private String phoneNumber;
    private String diplomaName;
    private String moderatorNotes;
    private LeadStatus status;
    private String closureReason;
    private TeleSalesInfo teleSales;
    private List<FollowUpInfo> followUps; // Include follow-ups in detailed view
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class FollowUpInfo {
        private Long id;
        private Integer sequence;
        private String message;
        private LocalDateTime createdAt;
    }
}
