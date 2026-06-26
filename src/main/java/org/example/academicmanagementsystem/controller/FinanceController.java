package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.FinanceOverviewResponse;
import org.example.academicmanagementsystem.dto.SalaryResponse;
import org.example.academicmanagementsystem.dto.ExpenseResponse;
import org.example.academicmanagementsystem.model.Expense;
import org.example.academicmanagementsystem.service.FinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT')")
public class FinanceController {

    private final FinanceService financeService;

    @GetMapping("/overview")
    public ResponseEntity<FinanceOverviewResponse> getOverview(@RequestParam String month) {
        return ResponseEntity.ok(financeService.getOverview(month));
    }

    @GetMapping("/salaries")
    public ResponseEntity<List<SalaryResponse>> getSalaries(@RequestParam String month) {
        return ResponseEntity.ok(financeService.getSalaries(month));
    }

    @PutMapping("/salaries/{id}")
    public ResponseEntity<SalaryResponse> updateSalary(@PathVariable Long id, @RequestBody org.example.academicmanagementsystem.dto.SalaryUpdateRequest request) {
        return ResponseEntity.ok(financeService.updateSalary(id, request));
    }

    @PostMapping("/salaries/run-payroll")
    public ResponseEntity<Map<String, String>> runPayroll(@RequestParam String month) {
        Map<String, String> result = financeService.runPayroll(month);
        if (result.containsKey("error")) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/expenses")
    public ResponseEntity<List<ExpenseResponse>> getExpenses(@RequestParam String month) {
        return ResponseEntity.ok(financeService.getExpenses(month));
    }

    @PostMapping("/expenses")
    public ResponseEntity<ExpenseResponse> addExpense(@RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.addExpense(expense));
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<ExpenseResponse> updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return ResponseEntity.ok(financeService.updateExpense(id, expense));
    }
}
