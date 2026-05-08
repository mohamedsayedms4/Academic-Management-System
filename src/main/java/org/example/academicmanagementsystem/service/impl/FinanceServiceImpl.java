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
    private final RoundDiplomaRepository roundDiplomaRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final UserRepository userRepository;

    @Override
    public FinanceOverviewResponse getOverview(String monthStr) {
        YearMonth targetMonth = YearMonth.parse(monthStr);
        LocalDate start = targetMonth.atDay(1);
        LocalDate end = targetMonth.atEndOfMonth();
        LocalDateTime startDt = start.atStartOfDay();
        LocalDateTime endDt = end.atTime(23, 59, 59);

        // Collected Revenue from Payments in this month
        BigDecimal collectedRevenue = paymentRepository.findPaymentsBetweenDates(startDt, endDt).stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Revenue from Invoices
        BigDecimal invoiceRevenue = invoiceRepository.findAll().stream()
                .filter(i -> !i.getInvoiceDate().isBefore(start) && !i.getInvoiceDate().isAfter(end))
                .map(InvoiceV2::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCollected = collectedRevenue.add(invoiceRevenue);

        // Pending Revenue (Installments due but not paid)
        BigDecimal pendingRevenue = calculatePendingRevenue(start, end);

        // Expenses
        BigDecimal totalExpenses = expenseRepository.findByExpenseDateBetween(start, end).stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Salaries
        BigDecimal totalSalaries = salaryRepository.findByMonth(monthStr).stream()
                .map(Salary::getNetSalary)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = totalCollected.subtract(totalExpenses).subtract(totalSalaries);

        // Breakdown
        Map<String, BigDecimal> breakdown = new HashMap<>();
        breakdown.put("Revenue", totalCollected);
        breakdown.put("Salaries", totalSalaries);
        breakdown.put("Expenses", totalExpenses);
        breakdown.put("Net profit", netProfit);

        // Top Revenue Diplomas
        List<FinanceOverviewResponse.TopDiplomaRevenue> topDiplomas = getTopDiplomas(startDt, endDt);

        return FinanceOverviewResponse.builder()
                .totalRevenue(totalCollected.add(pendingRevenue))
                .collectedRevenue(totalCollected)
                .pendingRevenue(pendingRevenue)
                .netProfit(netProfit)
                .financialBreakdown(breakdown)
                .revenueVsExpenses(getHistoricalChartData())
                .topRevenueDiplomas(topDiplomas)
                .build();
    }

    private BigDecimal calculatePendingRevenue(LocalDate start, LocalDate end) {
        BigDecimal pending = BigDecimal.ZERO;
        List<RoundDiploma> rds = roundDiplomaRepository.findWithInstallmentsInMonth(start, end);
        
        for (RoundDiploma rd : rds) {
            List<Student> students = rd.getStudents();
            if (students == null) continue;

            // Check each installment
            if (isDateInRange(rd.getInstallment1Date(), start, end)) {
                pending = pending.add(calculateMissingInstallments(students, 1, rd.getInstallment1Amount()));
            }
            if (isDateInRange(rd.getInstallment2Date(), start, end)) {
                pending = pending.add(calculateMissingInstallments(students, 2, rd.getInstallment2Amount()));
            }
            if (isDateInRange(rd.getInstallment3Date(), start, end)) {
                pending = pending.add(calculateMissingInstallments(students, 3, rd.getInstallment3Amount()));
            }
            if (isDateInRange(rd.getInstallment4Date(), start, end)) {
                pending = pending.add(calculateMissingInstallments(students, 4, rd.getInstallment4Amount()));
            }
        }
        return pending;
    }

    private boolean isDateInRange(LocalDate date, LocalDate start, LocalDate end) {
        return date != null && !date.isBefore(start) && !date.isAfter(end);
    }

    private BigDecimal calculateMissingInstallments(List<Student> students, int instNum, BigDecimal amount) {
        if (amount == null) return BigDecimal.ZERO;
        long missingCount = students.stream()
                .filter(s -> s.getPayments().stream()
                        .noneMatch(p -> p.getInstallmentNumber() != null && p.getInstallmentNumber() == instNum))
                .count();
        return amount.multiply(BigDecimal.valueOf(missingCount));
    }

    private List<FinanceOverviewResponse.TopDiplomaRevenue> getTopDiplomas(LocalDateTime start, LocalDateTime end) {
        List<Object[]> results = paymentRepository.getRevenueByDiplomaInRange(start, end);
        BigDecimal total = results.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return results.stream()
                .map(r -> {
                    String name = (String) r[0];
                    BigDecimal amount = (BigDecimal) r[1];
                    double perc = total.compareTo(BigDecimal.ZERO) > 0 
                        ? amount.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).doubleValue()
                        : 0.0;
                    return new FinanceOverviewResponse.TopDiplomaRevenue(name, amount, perc);
                })
                .sorted((a, b) -> b.getRevenue().compareTo(a.getRevenue()))
                .collect(Collectors.toList());
    }

    private List<FinanceOverviewResponse.DataPoint> getHistoricalChartData() {
        List<FinanceOverviewResponse.DataPoint> data = new ArrayList<>();
        YearMonth current = YearMonth.now();
        
        for (int i = 5; i >= 0; i--) {
            YearMonth month = current.minusMonths(i);
            LocalDate start = month.atDay(1);
            LocalDate end = month.atEndOfMonth();
            LocalDateTime startDt = start.atStartOfDay();
            LocalDateTime endDt = end.atTime(23, 59, 59);

            BigDecimal revenue = paymentRepository.findPaymentsBetweenDates(startDt, endDt).stream()
                    .map(Payment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal expenses = expenseRepository.findByExpenseDateBetween(start, end).stream()
                    .map(Expense::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            data.add(new FinanceOverviewResponse.DataPoint(month.getMonth().name().substring(0, 3), revenue, expenses));
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
