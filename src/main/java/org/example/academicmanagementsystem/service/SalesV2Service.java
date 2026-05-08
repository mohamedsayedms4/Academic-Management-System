package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.SalesV2Request;
import org.example.academicmanagementsystem.dto.SalesV2Response;

import java.util.List;

public interface SalesV2Service {
    SalesV2Response createSales(SalesV2Request request);
    List<SalesV2Response> getAllSales();
    SalesV2Response updateSales(Long id, SalesV2Request request);
    void deleteSales(Long id);
}
