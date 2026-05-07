package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.InvoiceV2Request;
import org.example.academicmanagementsystem.dto.InvoiceV2Response;
import org.example.academicmanagementsystem.service.InvoiceV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InvoiceV2Controller {

    private final InvoiceV2Service invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceV2Response> createInvoice(@RequestBody InvoiceV2Request request) {
        return ResponseEntity.ok(invoiceService.createInvoice(request));
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceV2Response>> getInvoices(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(invoiceService.getInvoices(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceV2Response> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InvoiceV2Response> updateInvoice(
            @PathVariable Long id,
            @RequestBody InvoiceV2Request request) {
        return ResponseEntity.ok(invoiceService.updateInvoice(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
