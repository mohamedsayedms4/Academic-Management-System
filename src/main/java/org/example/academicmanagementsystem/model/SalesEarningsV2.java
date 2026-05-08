package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "sales_earnings_v2")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SalesEarningsV2 extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "sales_id")
    private SalesV2 sales;

    private Integer totalClients;
    private Double commissionAmount;

    @Enumerated(EnumType.STRING)
    private EarningsStatus status;

    private LocalDate paymentDate;
}
