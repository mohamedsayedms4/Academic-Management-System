package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.FinanceOverviewResponse;
import org.example.academicmanagementsystem.dto.SalaryResponse;
import org.example.academicmanagementsystem.dto.ExpenseResponse;
import org.example.academicmanagementsystem.model.Expense;

import java.util.List;
import java.util.Map;

public interface FinanceService {
    FinanceOverviewResponse getOverview(String month);
    List<SalaryResponse> getSalaries(String month);
    SalaryResponse updateSalary(Long id, org.example.academicmanagementsystem.dto.SalaryUpdateRequest request);
    Map<String, String> runPayroll(String month);
    List<ExpenseResponse> getExpenses(String month);
    ExpenseResponse addExpense(Expense expense);
    ExpenseResponse updateExpense(Long id, Expense expense);
}
