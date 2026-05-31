package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.TelesalesEarningResponse;
import org.example.academicmanagementsystem.model.StudentStatus;
import org.example.academicmanagementsystem.model.StudentV2;
import org.example.academicmanagementsystem.model.TelesalesEarning;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.StudentV2Repository;
import org.example.academicmanagementsystem.repository.TelesalesEarningRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/earnings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelesalesEarningController {

    private final TelesalesEarningRepository earningRepository;
    private final UserRepository userRepository;
    private final StudentV2Repository studentV2Repository;

    @GetMapping
    public ResponseEntity<List<TelesalesEarningResponse>> getEarnings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        List<TelesalesEarning> earnings = earningRepository.searchEarnings(
                (status == null || status.trim().isEmpty()) ? null : status,
                (search == null || search.trim().isEmpty()) ? null : search
        );

        List<TelesalesEarningResponse> response = earnings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<TelesalesEarningResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        
        TelesalesEarning earning = earningRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Earning record not found with id: " + id));

        String newStatus = body.get("status");
        if (newStatus != null) {
            earning.setStatus(newStatus.toUpperCase());
            if ("PAID".equalsIgnoreCase(newStatus)) {
                earning.setPaymentDate(LocalDate.now());
            } else {
                earning.setPaymentDate(null);
            }
            earning = earningRepository.save(earning);
        }

        return ResponseEntity.ok(mapToResponse(earning));
    }

    @PostMapping("/calculate")
    public ResponseEntity<List<TelesalesEarningResponse>> calculateEarnings() {
        List<User> salesUsers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.TELESALES || u.getRole() == UserRole.MODERATOR)
                .collect(Collectors.toList());

        List<TelesalesEarning> updatedEarnings = new ArrayList<>();

        for (User user : salesUsers) {
            List<StudentV2> students = studentV2Repository.findBySalesPersonId(user.getId()).stream()
                    .filter(s -> s.getStatus() != StudentStatus.CANCELLED)
                    .collect(Collectors.toList());

            int totalClients = students.size();
            BigDecimal totalCommission = BigDecimal.ZERO;
            double commissionRate = user.getCommission() != null ? user.getCommission() : 0.0;

            for (StudentV2 student : students) {
                BigDecimal deposit = student.getDepositAmount() != null ? student.getDepositAmount() : BigDecimal.ZERO;
                BigDecimal studentComm = deposit.multiply(BigDecimal.valueOf(commissionRate))
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                totalCommission = totalCommission.add(studentComm);
            }

            TelesalesEarning earning = earningRepository.findByTelesalesId(user.getId())
                    .orElse(new TelesalesEarning());

            if (earning.getId() == null) {
                earning.setTelesales(user);
                earning.setStatus("PENDING");
            }
            
            earning.setTotalClients(totalClients);
            earning.setCommissionAmount(totalCommission);

            updatedEarnings.add(earningRepository.save(earning));
        }

        List<TelesalesEarningResponse> response = updatedEarnings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    private TelesalesEarningResponse mapToResponse(TelesalesEarning earning) {
        return TelesalesEarningResponse.builder()
                .id(earning.getId())
                .telesalesId(earning.getTelesales().getId())
                .telesalesName(earning.getTelesales().getFullName())
                .telesalesPhone(earning.getTelesales().getPhone())
                .totalClients(earning.getTotalClients())
                .commissionAmount(earning.getCommissionAmount())
                .status(earning.getStatus())
                .paymentDate(earning.getPaymentDate())
                .build();
    }
}
