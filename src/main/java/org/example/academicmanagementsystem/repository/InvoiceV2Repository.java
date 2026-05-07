package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.InvoiceV2;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceV2Repository extends JpaRepository<InvoiceV2, Long> {

    @Query("SELECT i FROM InvoiceV2 i WHERE " +
           "LOWER(i.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.customerPhone) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<InvoiceV2> searchInvoices(@Param("search") String search, Pageable pageable);
}
