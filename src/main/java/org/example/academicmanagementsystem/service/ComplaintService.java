package org.example.academicmanagementsystem.service;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.model.Complaint;
import org.example.academicmanagementsystem.model.ComplaintStatus;
import org.example.academicmanagementsystem.repository.ComplaintRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;

    public List<Complaint> findAll() {
        return complaintRepository.findAll();
    }

    @Transactional
    public Complaint create(Complaint complaint) {
        complaint.setTicketNumber("COMP-" + LocalDateTime.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        complaint.setStatus(ComplaintStatus.OPEN);
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Complaint resolve(Long id, String response, org.example.academicmanagementsystem.model.User resolver) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setStatus(ComplaintStatus.RESOLVED);
        complaint.setResponseText(response);
        complaint.setResolvedBy(resolver);
        complaint.setResolvedAt(LocalDateTime.now());
        return complaintRepository.save(complaint);
    }
}
