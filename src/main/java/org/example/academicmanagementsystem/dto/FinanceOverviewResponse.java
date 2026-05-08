package org.example.academicmanagementsystem.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceOverviewResponse {
    private BigDecimal totalRevenue;
    private BigDecimal collectedRevenue;
    private BigDecimal pendingRevenue;
    private BigDecimal netProfit;
    
    private List<DataPoint> revenueVsExpenses;
    private Map<String, BigDecimal> financialBreakdown; // Revenue, Salaries, Expenses, Commission, Net Profit
    private List<TopDiplomaRevenue> topRevenueDiplomas;

    @Data
    @AllArgsConstructor
    public static class DataPoint {
        private String label; // Month name
        private BigDecimal revenue;
        private BigDecimal expenses;
    }

    @Data
    @AllArgsConstructor
    public static class TopDiplomaRevenue {
        private String diplomaName;
        private BigDecimal revenue;
        private Double percentage;
    }
}
