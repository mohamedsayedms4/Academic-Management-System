package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.SalesEarningsV2Response;
import org.example.academicmanagementsystem.model.EarningsStatus;
import org.example.academicmanagementsystem.model.SalesEarningsV2;
import org.example.academicmanagementsystem.repository.SalesEarningsV2Repository;
import org.example.academicmanagementsystem.service.EarningsV2Service;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EarningsV2ServiceImpl implements EarningsV2Service {

    private final SalesEarningsV2Repository repository;

    @Override
    public List<SalesEarningsV2Response> getAllEarnings() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SalesEarningsV2Response markAsPaid(Long id) {
        SalesEarningsV2 earnings = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Earnings record not found"));
        earnings.setStatus(EarningsStatus.PAID);
        earnings.setPaymentDate(LocalDate.now());
        return toResponse(repository.save(earnings));
    }

    @Override
    public SalesEarningsV2Response revertToPending(Long id) {
        SalesEarningsV2 earnings = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Earnings record not found"));
        earnings.setStatus(EarningsStatus.PENDING);
        earnings.setPaymentDate(null);
        return toResponse(repository.save(earnings));
    }

    private SalesEarningsV2Response toResponse(SalesEarningsV2 earnings) {
        return new SalesEarningsV2Response(
                earnings.getId(),
                earnings.getSales() != null ? earnings.getSales().getName() : "Unknown",
                earnings.getTotalClients(),
                earnings.getCommissionAmount(),
                earnings.getStatus(),
                earnings.getPaymentDate()
        );
    }
}
