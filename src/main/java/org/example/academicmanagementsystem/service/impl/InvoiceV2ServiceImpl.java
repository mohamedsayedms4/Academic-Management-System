package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.InvoiceV2Request;
import org.example.academicmanagementsystem.dto.InvoiceV2Response;
import org.example.academicmanagementsystem.model.InvoiceV2;
import org.example.academicmanagementsystem.repository.InvoiceV2Repository;
import org.example.academicmanagementsystem.service.InvoiceV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InvoiceV2ServiceImpl implements InvoiceV2Service {

    private final InvoiceV2Repository invoiceRepository;

    @Override
    @Transactional
    public InvoiceV2Response createInvoice(InvoiceV2Request request) {
        InvoiceV2 invoice = new InvoiceV2();
        mapToEntity(request, invoice);
        InvoiceV2 saved = invoiceRepository.save(invoice);
        return mapToResponse(saved);
    }

    @Override
    public Page<InvoiceV2Response> getInvoices(String search, Pageable pageable) {
        Page<InvoiceV2> invoices;
        if (search != null && !search.isEmpty()) {
            invoices = invoiceRepository.searchInvoices(search, pageable);
        } else {
            invoices = invoiceRepository.findAll(pageable);
        }
        return invoices.map(this::mapToResponse);
    }

    @Override
    public InvoiceV2Response getInvoiceById(Long id) {
        InvoiceV2 invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        return mapToResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceV2Response updateInvoice(Long id, InvoiceV2Request request) {
        InvoiceV2 invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
        mapToEntity(request, invoice);
        InvoiceV2 updated = invoiceRepository.save(invoice);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        if (!invoiceRepository.existsById(id)) {
            throw new RuntimeException("Invoice not found with id: " + id);
        }
        invoiceRepository.deleteById(id);
    }

    private void mapToEntity(InvoiceV2Request request, InvoiceV2 invoice) {
        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setCustomerName(request.getCustomerName());
        invoice.setCustomerPhone(request.getCustomerPhone());
        invoice.setAmount(request.getAmount());
        invoice.setNotes(request.getNotes());
    }

    private InvoiceV2Response mapToResponse(InvoiceV2 invoice) {
        InvoiceV2Response response = new InvoiceV2Response();
        response.setId(invoice.getId());
        response.setInvoiceDate(invoice.getInvoiceDate());
        response.setCustomerName(invoice.getCustomerName());
        response.setCustomerPhone(invoice.getCustomerPhone());
        response.setAmount(invoice.getAmount());
        response.setNotes(invoice.getNotes());
        response.setCreatedAt(invoice.getCreatedAt());
        return response;
    }
}
