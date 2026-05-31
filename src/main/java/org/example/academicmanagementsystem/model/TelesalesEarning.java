package org.example.academicmanagementsystem.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "telesales_earnings")
@Data
@EqualsAndHashCode(callSuper = true)
@AllArgsConstructor
@NoArgsConstructor
public class TelesalesEarning extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "telesales_id", nullable = false)
    private User telesales;

    private Integer totalClients = 0;

    private BigDecimal commissionAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, PAID

    private LocalDate paymentDate;
}
