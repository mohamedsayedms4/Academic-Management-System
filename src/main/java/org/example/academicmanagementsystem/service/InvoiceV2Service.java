package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.InvoiceV2Request;
import org.example.academicmanagementsystem.dto.InvoiceV2Response;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InvoiceV2Service {
    InvoiceV2Response createInvoice(InvoiceV2Request request);
    Page<InvoiceV2Response> getInvoices(String search, Pageable pageable);
    InvoiceV2Response getInvoiceById(Long id);
    InvoiceV2Response updateInvoice(Long id, InvoiceV2Request request);
    void deleteInvoice(Long id);
}
