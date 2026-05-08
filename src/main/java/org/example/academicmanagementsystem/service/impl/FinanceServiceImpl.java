package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.FinanceOverviewResponse;
import org.example.academicmanagementsystem.dto.SalaryResponse;
import org.example.academicmanagementsystem.dto.ExpenseResponse;
import org.example.academicmanagementsystem.model.*;
import org.example.academicmanagementsystem.repository.*;
import org.example.academicmanagementsystem.service.FinanceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final InvoiceV2Repository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final SalaryRepository salaryRepository;
    private final ExpenseRepository expenseRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final UserRepository userRepository;

    @Override
    public FinanceOverviewResponse getOverview(String monthStr) {
        YearMonth targetMonth = YearMonth.parse(monthStr);
        LocalDate start = targetMonth.atDay(1);
        LocalDate end = targetMonth.atEndOfMonth();

        // Revenue from Invoices
        BigDecimal invoiceRevenue = invoiceRepository.findAll().stream()
                .filter(i -> !i.getInvoiceDate().isBefore(start) && !i.getInvoiceDate().isAfter(end))
                .map(InvoiceV2::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Revenue from Student Payments
        BigDecimal paymentRevenue = paymentRepository.findAll().stream()
                .filter(p -> !p.getPaymentDate().toLocalDate().isBefore(start) && !p.getPaymentDate().toLocalDate().isAfter(end))
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalRevenue = invoiceRevenue.add(paymentRevenue);

        // Expenses
        BigDecimal totalExpenses = expenseRepository.findByExpenseDateBetween(start, end).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Salaries
        BigDecimal totalSalaries = salaryRepository.findByMonth(monthStr).stream()
                .map(Salary::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalRevenue.subtract(totalExpenses).subtract(totalSalaries);

        // Breakdown
        Map<String, BigDecimal> breakdown = new HashMap<>();
        breakdown.put("Revenue", totalRevenue);
        breakdown.put("Salaries", totalSalaries);
        breakdown.put("Expenses", totalExpenses);
        breakdown.put("Net profit", netProfit);

        return FinanceOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .collectedRevenue(totalRevenue) // Simplified
                .pendingRevenue(BigDecimal.ZERO)
                .netProfit(netProfit)
                .financialBreakdown(breakdown)
                .revenueVsExpenses(getChartData())
                .topRevenueDiplomas(new ArrayList<>()) // Placeholder
                .build();
    }

    private List<FinanceOverviewResponse.DataPoint> getChartData() {
        List<FinanceOverviewResponse.DataPoint> data = new ArrayList<>();
        // Mocking last 6 months
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"};
        for (String m : months) {
            data.add(new FinanceOverviewResponse.DataPoint(m, 
                new BigDecimal(Math.random() * 200000 + 50000).setScale(0, RoundingMode.HALF_UP),
                new BigDecimal(Math.random() * 100000 + 20000).setScale(0, RoundingMode.HALF_UP)));
        }
        return data;
    }

    @Override
    public List<SalaryResponse> getSalaries(String month) {
        return salaryRepository.findByMonth(month).stream()
                .map(s -> SalaryResponse.builder()
                        .id(s.getId())
                        .employeeId(s.getEmployee().getId())
                        .employeeName(s.getEmployee().getFullName())
                        .role(s.getEmployee().getRole().name())
                        .employmentType(s.getEmployee().getEmploymentType())
                        .phone(s.getEmployee().getPhone())
                        .salary(s.getBaseSalary())
                        .bonus(s.getBonuses())
                        .overtime(s.getOvertime())
                        .total(s.getNetSalary())
                        .payMethod(s.getEmployee().getPaymentMethod())
                        .payed(s.getPaidAmount())
                        .remaining(s.getNetSalary().subtract(s.getPaidAmount()))
                        .status(s.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, String> runPayroll(String month) {
        Optional<PayrollRecord> existing = payrollRecordRepository.findByMonth(month);
        if (existing.isPresent()) {
            return Collections.singletonMap("error", "ALREADY_EXISTS");
        }

        List<User> activeEmployees = userRepository.findAll().stream()
                .filter(u -> u.getActive() && u.getBaseSalary() != null)
                .collect(Collectors.toList());

        BigDecimal totalPayroll = BigDecimal.ZERO;

        for (User emp : activeEmployees) {
            Salary salary = new Salary();
            salary.setEmployee(emp);
            salary.setMonth(month);
            salary.setBaseSalary(BigDecimal.valueOf(emp.getBaseSalary()));
            salary.setNetSalary(BigDecimal.valueOf(emp.getBaseSalary()));
            salary.setStatus(SalaryStatus.PENDING);
            salaryRepository.save(salary);
            totalPayroll = totalPayroll.add(salary.getNetSalary());
        }

        PayrollRecord record = new PayrollRecord();
        record.setMonth(month);
        record.setTotalPayroll(totalPayroll);
        payrollRecordRepository.save(record);

        return Collections.singletonMap("success", "Payroll generated for " + activeEmployees.size() + " employees");
    }

    @Override
    public List<ExpenseResponse> getExpenses(String monthStr) {
        YearMonth targetMonth = YearMonth.parse(monthStr);
        LocalDate start = targetMonth.atDay(1);
        LocalDate end = targetMonth.atEndOfMonth();

        return expenseRepository.findByExpenseDateBetween(start, end).stream()
                .map(e -> ExpenseResponse.builder()
                        .id(e.getId())
                        .title(e.getTitle())
                        .amount(e.getAmount())
                        .payed(e.getPaidAmount())
                        .remaining(e.getAmount().subtract(e.getPaidAmount()))
                        .payMethod(e.getPaymentMethod())
                        .date(e.getExpenseDate())
                        .note(e.getNote())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public ExpenseResponse addExpense(Expense expense) {
        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .amount(saved.getAmount())
                .payed(saved.getPaidAmount())
                .remaining(saved.getAmount().subtract(saved.getPaidAmount()))
                .payMethod(saved.getPaymentMethod())
                .date(saved.getExpenseDate())
                .note(saved.getNote())
                .build();
    }
}
