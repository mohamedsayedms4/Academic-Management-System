package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.SalesEarningsV2Response;

import java.util.List;

public interface EarningsV2Service {
    List<SalesEarningsV2Response> getAllEarnings();
    SalesEarningsV2Response markAsPaid(Long id);
    SalesEarningsV2Response revertToPending(Long id);
}
