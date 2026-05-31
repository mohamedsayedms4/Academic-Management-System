package org.example.academicmanagementsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.academicmanagementsystem.model.*;
import org.example.academicmanagementsystem.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;    

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final RoundRepository roundRepository;
    private final RoundDiplomaRepository roundDiplomaRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final TaskRepository taskRepository;
    private final ComplaintRepository complaintRepository;
    private final SalaryRepository salaryRepository;
    private final FollowUpRepository followUpRepository;
    private final DiplomaRepository diplomaRepository;
    private final AttendanceRepository attendanceRepository;
    private final DiplomaV2Repository diplomaV2Repository;
    private final RoundV2Repository roundV2Repository;
    private final InstructorV2Repository instructorV2Repository;
    private final ExpenseRepository expenseRepository;
    private final PayrollRecordRepository payrollRecordRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            // Seed V2 Data (Independent check inside method)
            seedV2Data();

            // Check if data already exists
            // 1. Seed Users (Idempotent)
            List<User> users = seedUsers();
            System.out.println(">>> Users synchronized: " + users.size());

            // 2. Seed Salaries (If empty)
            if (salaryRepository.count() == 0) {
                List<Salary> salaries = seedSalaries(users);
                System.out.println(">>> Seeded " + salaries.size() + " salaries");
                
                // 3. Seed PayrollRecords based on seeded salaries
                seedPayrollRecordsFromSalaries(salaries);
                System.out.println(">>> Seeded Payroll Records");
            }

            // 4. Seed Expenses (If empty)
            if (expenseRepository.count() == 0) {
                seedExpenses();
                System.out.println(">>> Seeded Expenses");
            }

            // Check if alaa design data exists for rounds/diplomas (V2)
            if (diplomaV2Repository.count() == 0) {
                seedV2Data();
                System.out.println(">>> Seeded V2 Design Data");
            }

            // 5. Seed Diplomas/Rounds V1 (If empty)
            if (diplomaRepository.count() == 0) {
                List<Diploma> diplomas = seedDiplomas();
                List<Round> rounds = seedRounds(diplomas, users);
                List<Student> students = seedStudents(rounds);
                seedPayments(students, users);
                seedTasks(users);
                seedComplaints(students, users);
                System.out.println(">>> Seeded V1 Base Data (Diplomas, Rounds, Students)");
            }

            // Always refresh moderator seeded leads to guarantee fresh timestamps for the current week's leaderboard
            java.util.List<String> seededPhones = java.util.List.of(
                "01099882211", "01099882212", "01099882213", "01099882214", "01099882215",
                "01077665541", "01077665542", "01077665543"
            );
            for (String phone : seededPhones) {
                leadRepository.findByPhoneNumber(phone).forEach(leadRepository::delete);
            }
            seedLeads(users, diplomaRepository.findAll());
            System.out.println(">>> Seeded fresh moderator leads for active week");
 
            log.info("Database seeding completed successfully!");
        };
    }

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();

        // Helper to save only if not exists
        autoSaveUser(users, "admin", "admin@academic.com", "admin123", "أحمد محمود", UserRole.ADMIN, 5000.0, "Full time", "Cash");
        autoSaveUser(users, "moderator", "moderator@academic.com", "moderator123", "سارة علي", UserRole.MODERATOR, 5000.0, "Full time", "Cash");
        autoSaveUser(users, "telesales1", "telesales1@academic.com", "telesales123", "محمد أحمد", UserRole.TELESALES, 5000.0, "Full time", "Cash");
        autoSaveUser(users, "accountant", "accountant@academic.com", "accountant123", "نور الدين", UserRole.ACCOUNTANT, 5000.0, "Full time", "Cash");
        
        // Design users
        autoSaveUser(users, "alaa", "alaa@academic.com", "alaa123", "Alaa Ehab", UserRole.MODERATOR, 11000.0, "Full time", "Insta");
        autoSaveUser(users, "ahmed_ali", "ahmed@academic.com", "ahmed123", "Ahmed Ali", UserRole.EMPLOYEE, 12000.0, "Full time", "Cash");
        autoSaveUser(users, "designer1", "designer1@academic.com", "pass123", "Alaa Ehab", UserRole.EMPLOYEE, 11000.0, "freelance", "Insta");
        autoSaveUser(users, "lorem", "lorem@academic.com", "pass123", "Alaa Ehab", UserRole.EMPLOYEE, 11000.0, "freelance", "Insta");

        // Ensure we return all users from DB if list is empty (for subsequent seeding)
        if (users.isEmpty()) {
            return userRepository.findAll();
        }
        return users;
    }

    private void autoSaveUser(List<User> users, String username, String email, String pass, String name, UserRole role, Double sal, String type, String method) {
        userRepository.findByUsername(username).ifPresentOrElse(
            users::add,
            () -> users.add(userRepository.save(createUser(username, email, pass, name, role, sal, type, method)))
        );
    }

    private User createUser(String username, String email, String password, String fullName, UserRole role) {
        return createUser(username, email, password, fullName, role, 5000.0, "Full time", "Cash");
    }

    private User createUser(String username, String email, String password, String fullName, UserRole role, 
                          Double baseSalary, String empType, String payMethod) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        user.setBaseSalary(baseSalary);
        user.setEmploymentType(empType);
        user.setPaymentMethod(payMethod);
        user.setPhone("0125478541");
        return user;
    }

    private List<Diploma> seedDiplomas() {
        List<Diploma> diplomas = new ArrayList<>();
        diplomas.add(createDiploma("BIM Architecture diploma", "Building Information Modeling for Architects"));
        diplomas.add(createDiploma("Interior Design & Decoration", "Modern interior design and decoration"));
        diplomas.add(createDiploma("Full Stack Development", "Web development with Java and React"));
        diplomas.add(createDiploma("Data Science Diploma", "Data analysis and Machine Learning"));
        diplomas.add(createDiploma("Digital Marketing Diploma", "SEO, SEM and Social Media"));
        return diplomaRepository.saveAll(diplomas);
    }

    private Diploma createDiploma(String name, String desc) {
        Diploma d = new Diploma();
        d.setName(name);
        d.setDescription(desc);
        return d;
    }

    private List<Lead> seedLeads(List<User> users, List<Diploma> diplomas) {
        List<Lead> leads = new ArrayList<>();

        User telesales = users.stream().filter(u -> u.getRole() == UserRole.TELESALES).findFirst().orElse(users.get(0));
        Diploma dip = diplomas.isEmpty() ? null : diplomas.get(0);

        // Alaa (5 leads)
        for (int i = 1; i <= 5; i++) {
            Lead l = createLead("Alaa Lead " + i, "0109988221" + i, dip, "Notes for Alaa lead " + i, LeadStatus.OPEN, telesales, null, null);
            l.setCreatedBy("alaa");
            l.setUpdatedBy("alaa");
            leads.add(l);
        }

        // Moderator (3 leads)
        for (int i = 1; i <= 3; i++) {
            Lead l = createLead("Moderator Lead " + i, "0107766554" + i, dip, "Notes for Moderator lead " + i, LeadStatus.OPEN, telesales, null, null);
            l.setCreatedBy("moderator");
            l.setUpdatedBy("moderator");
            leads.add(l);
        }

        return leadRepository.saveAll(leads);
    }

    private Lead createLead(String fullName, String phone, Diploma diploma, String notes, LeadStatus status, User telesales,
                            String closureReason, String email) {
        Lead lead = new Lead();
        lead.setFullName(fullName);
        lead.setPhoneNumber(phone);
        lead.setDiploma(diploma);
        lead.setModeratorNotes(notes);
        lead.setStatus(status);
        lead.setTeleSales(telesales);
        lead.setClosureReason(closureReason);
        return lead;
    }

    private List<FollowUp> seedFollowUps(List<Lead> leads) {
        List<FollowUp> followUps = new ArrayList<>();

        // Follow-ups for active leads
        followUps.add(createFollowUp(leads.get(0), 1, "Initial contact made. Interested in curriculum details."));
        followUps.add(createFollowUp(leads.get(0), 2, "Sent brochure via WhatsApp. Waiting for reply."));

        followUps.add(createFollowUp(leads.get(1), 1, "discussed schedule options. Prefers 6 PM slots."));

        return followUpRepository.saveAll(followUps);
    }

    private FollowUp createFollowUp(Lead lead, int sequence, String message) {
        FollowUp followUp = new FollowUp();
        followUp.setLead(lead);
        followUp.setSequence(sequence);
        followUp.setMessage(message);
        return followUp;
    }

    private List<Round> seedRounds(List<Diploma> diplomas, List<User> users) {
        List<Round> rounds = new ArrayList<>();
        // Round 1 - Full Stack
        Round round1 = createRound("Round 1 - Full Stack", LocalDate.of(2025, 12, 28));
        seedRoundDiplomas(round1, List.of(diplomas.get(2)), users);
        rounds.add(round1);

        // Round 2 - Data Science
        Round round2 = createRound("Round 2 - Data Science", LocalDate.of(2026, 2, 28));
        seedRoundDiplomas(round2, List.of(diplomas.get(3)), users);
        rounds.add(round2);

        // Round 3 - Digital Marketing
        Round round3 = createRound("Round 3 - Digital Marketing", LocalDate.of(2026, 3, 14));
        seedRoundDiplomas(round3, List.of(diplomas.get(4)), users);
        rounds.add(round3);

        // Round 4 - Cybersecurity
        Round round4 = createRound("Round 4 - Cybersecurity", LocalDate.of(2026, 4, 28));
        seedRoundDiplomas(round4, List.of(diplomas.get(0), diplomas.get(1)), users);
        rounds.add(round4);

        // Round 9 - BIM & Design
        Round round9 = createRound("Round 9 - BIM & Design", LocalDate.of(2025, 1, 15));
        seedRoundDiplomas(round9, List.of(diplomas.get(0), diplomas.get(1)), users);
        rounds.add(round9);

        return rounds;
    }

    private Round createRound(String name, LocalDate startDate) {
        Round round = new Round();
        round.setName(name);
        round.setStartDate(startDate);
        round.setStatus(RoundStatus.ACTIVE);
        return roundRepository.save(round);
    }

    private void seedRoundDiplomas(Round round, List<Diploma> diplomas, List<User> users) {
        User instructor = users.stream().filter(u -> u.getRole() == UserRole.EMPLOYEE).findFirst().get();
        List<RoundDiploma> rdList = new ArrayList<>();
        for (Diploma d : diplomas) {
            rdList.add(createRoundDiploma(round, d, instructor, new BigDecimal("15000.00"), 30,
                    new BigDecimal("3750.00"), round.getStartDate(), round.getStartDate().plusMonths(2), 
                    round.getStartDate().plusMonths(4), round.getStartDate().plusMonths(6)));
        }
        roundDiplomaRepository.saveAll(rdList);
        round.setRoundDiplomas(rdList);
    }

    private RoundDiploma createRoundDiploma(Round round, Diploma diploma, User instructor, BigDecimal totalPrice, int capacity, 
                                            BigDecimal instAmount, LocalDate d1, LocalDate d2, LocalDate d3, LocalDate d4) {
        RoundDiploma rd = new RoundDiploma();
        rd.setRound(round);
        rd.setDiploma(diploma);
        rd.setInstructor(instructor);
        rd.setTotalPrice(totalPrice);
        rd.setStartDate(round.getStartDate());
        rd.setEndDate(round.getEndDate());
        rd.setTotalStudents(capacity);
        rd.setCurrentEnrollment(0);
        
        rd.setInstallment1Amount(instAmount);
        rd.setInstallment2Amount(instAmount);
        rd.setInstallment3Amount(instAmount);
        rd.setInstallment4Amount(instAmount);
        
        rd.setInstallment1Date(d1);
        rd.setInstallment2Date(d2);
        rd.setInstallment3Date(d3);
        rd.setInstallment4Date(d4);
        return rd;
    }

    private List<Student> seedStudents(List<Round> rounds) {
        List<Student> students = new ArrayList<>();
        RoundDiploma rd1 = rounds.get(0).getRoundDiplomas().get(0); // Round 9 - BIM

        // Students in RD1
        students.add(createStudent("Ahmed Hassan", "01011111111", "ahmed.h@example.com", rd1,
                new BigDecimal("16000.00"), new BigDecimal("4000.00"), new BigDecimal("12000.00"),
                PaymentStatus.PARTIAL, LocalDate.of(2025, 1, 15)));
        students.add(createStudent("Mariam Ezzat", "01022222222", "mariam.e@example.com", rd1,
                new BigDecimal("16000.00"), new BigDecimal("16000.00"), BigDecimal.ZERO, PaymentStatus.PAID,
                LocalDate.of(2025, 1, 15)));

        return studentRepository.saveAll(students);
    }

    private Student createStudent(String name, String phone, String email, RoundDiploma rd, BigDecimal totalFees,
                                  BigDecimal paid, BigDecimal remaining, PaymentStatus status, LocalDate enrollmentDate) {
        Student student = new Student();
        student.setName(name);
        student.setPhone(phone);
        student.setEmail(email);
        student.setRoundDiploma(rd);
        student.setTotalFees(totalFees);
        student.setPaidAmount(paid);
        student.setRemainingAmount(remaining);
        student.setPaymentStatus(status);
        student.setEnrollmentDate(enrollmentDate.atStartOfDay());
        return student;
    }

    private List<Payment> seedPayments(List<Student> students, List<User> users) {
        List<Payment> payments = new ArrayList<>();
        User accountant = users.stream().filter(u -> u.getRole() == UserRole.ACCOUNTANT).findFirst()
                .orElse(users.get(0));

        // Distribution of payments over last 5 months
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < 5; i++) {
            LocalDateTime month = now.minusMonths(i);
            payments.add(createPayment(students.get(0), new BigDecimal(4000 + (i * 500)), month.withDayOfMonth(10),
                    PaymentType.INSTALLMENT, PaymentMethod.CASH, "RCP-10"+i, "Installment " + (5-i), 1, accountant));
            
            if (students.size() > 1) {
                payments.add(createPayment(students.get(1), new BigDecimal(16000), month.minusDays(5),
                        PaymentType.FULL, PaymentMethod.BANK_TRANSFER, "RCP-20"+i, "Full payment", null, accountant));
            }
        }

        return paymentRepository.saveAll(payments);
    }

    private Payment createPayment(Student student, BigDecimal amount, LocalDateTime date, PaymentType type,
                                  PaymentMethod method, String receipt, String notes, Integer installmentNum, User processedBy) {
        Payment payment = new Payment();
        payment.setStudent(student);
        payment.setAmount(amount);
        payment.setPaymentDate(date);
        payment.setType(type);
        payment.setMethod(method);
        payment.setReceiptNumber(receipt);
        payment.setNotes(notes);
        payment.setInstallmentNumber(installmentNum);
        payment.setProcessedBy(processedBy);
        if (type == PaymentType.FULL) {
            payment.setInstallmentNumber(null);
        }
        if (processedBy != null) {
            payment.setProcessedAt(LocalDateTime.now());
        }
        return payment;
    }

    private List<Task> seedTasks(List<User> users) {
        List<Task> tasks = new ArrayList<>();
        User admin = users.get(0);
        User telesales1 = users.get(2);

        tasks.add(createTask("Follow up with new leads", "Call the 5 new leads assigned today", telesales1, admin,
                TaskStatus.PENDING, TaskPriority.HIGH, LocalDateTime.now().plusDays(1)));
        
        return taskRepository.saveAll(tasks);
    }

    private Task createTask(String title, String desc, User assignedTo, User creator, TaskStatus status,
                            TaskPriority priority, LocalDateTime due) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(desc);
        task.setAssignedTo(assignedTo);
        task.setCreator(creator);
        task.setStatus(status);
        task.setPriority(priority);
        task.setDueDate(due);
        return task;
    }

    private List<Complaint> seedComplaints(List<Student> students, List<User> users) {
        List<Complaint> complaints = new ArrayList<>();
        complaints.add(createComplaint(students.get(0), "Ahmed Hassan", "01011111111", "AC is not working in Lab 2",
                ComplaintStatus.OPEN, "COMP-001", null));
        return complaintRepository.saveAll(complaints);
    }

    private Complaint createComplaint(Student student, String name, String phone, String text, ComplaintStatus status,
                                      String ticket, User resolvedBy) {
        Complaint complaint = new Complaint();
        complaint.setStudent(student);
        complaint.setStudentName(name);
        complaint.setPhone(phone);
        complaint.setComplaintText(text);
        complaint.setStatus(status);
        complaint.setTicketNumber(ticket);
        complaint.setResolvedBy(resolvedBy);
        return complaint;
    }

    private List<Salary> seedSalaries(List<User> users) {
        List<Salary> salaries = new ArrayList<>();
        User accountant = users.stream().filter(u -> u.getRole() == UserRole.ACCOUNTANT).findFirst()
                .orElse(users.get(0));

        // Seed salaries for last 4 months (including current)
        LocalDate today = LocalDate.now();
        for (int i = 0; i < 4; i++) {
            String monthLabel = today.minusMonths(i).format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM"));
            
            for (User u : users) {
                if (u.getBaseSalary() != null) {
                    BigDecimal base = BigDecimal.valueOf(u.getBaseSalary());
                    BigDecimal bonus = new BigDecimal(500 + (Math.random() * 1000)).setScale(0, java.math.RoundingMode.HALF_UP);
                    BigDecimal overtime = new BigDecimal(200 + (Math.random() * 800)).setScale(0, java.math.RoundingMode.HALF_UP);
                    BigDecimal total = base.add(bonus).add(overtime);
                    
                    // For current month, maybe some are pending
                    SalaryStatus status = (i == 0 && Math.random() > 0.5) ? SalaryStatus.PENDING : SalaryStatus.PAID;
                    BigDecimal paidAmount = status == SalaryStatus.PAID ? total : BigDecimal.ZERO;
                    
                    salaries.add(createSalary(u, monthLabel, base, bonus, BigDecimal.ZERO, overtime, total, paidAmount, status, accountant));
                }
            }
        }
        
        return salaryRepository.saveAll(salaries);
    }

    private void seedPayrollRecordsFromSalaries(List<Salary> salaries) {
        Map<String, List<Salary>> byMonth = salaries.stream().collect(Collectors.groupingBy(Salary::getMonth));
        
        byMonth.forEach((month, monthSalaries) -> {
            if (payrollRecordRepository.findByMonth(month).isEmpty()) {
                BigDecimal total = monthSalaries.stream().map(Salary::getNetSalary).reduce(BigDecimal.ZERO, BigDecimal::add);
                BigDecimal paid = monthSalaries.stream().map(Salary::getPaidAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
                
                PayrollRecord record = new PayrollRecord();
                record.setMonth(month);
                record.setTotalPayroll(total);
                record.setPaidAmount(paid);
                payrollRecordRepository.save(record);
            }
        });
    }

    private void seedExpenses() {
        if (expenseRepository.count() > 0) return;
        List<Expense> expenses = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 0; i < 6; i++) {
            LocalDate month = now.minusMonths(i);
            expenses.add(createExpense("Rent - Building A", new BigDecimal("25000"), month.withDayOfMonth(1), PaymentMethod.BANK_TRANSFER.name()));
            expenses.add(createExpense("Electricity Bill", new BigDecimal(1200 + (Math.random() * 500)), month.withDayOfMonth(15), PaymentMethod.CASH.name()));
            expenses.add(createExpense("Internet Fiber", new BigDecimal("850"), month.withDayOfMonth(5), PaymentMethod.CASH.name()));
            expenses.add(createExpense("Marketing - Facebook Ads", new BigDecimal(5000 + (Math.random() * 2000)), month.withDayOfMonth(20), PaymentMethod.CARD.name()));
        }
        expenseRepository.saveAll(expenses);
    }

    private Expense createExpense(String title, BigDecimal amount, LocalDate date, String method) {
        Expense e = new Expense();
        e.setTitle(title);
        e.setAmount(amount);
        e.setExpenseDate(date);
        e.setPaidAmount(amount);
        e.setPaymentMethod(method);
        return e;
    }

    private Salary createSalary(User employee, String month, BigDecimal base, BigDecimal bonus, BigDecimal deduction,
                                BigDecimal overtime, BigDecimal total, BigDecimal paidAmount, SalaryStatus status, User processedBy) {
        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setMonth(month);
        salary.setBaseSalary(base);
        salary.setBonuses(bonus);
        salary.setDeductions(deduction);
        salary.setOvertime(overtime);
        salary.setNetSalary(total);
        salary.setPaidAmount(paidAmount);
        salary.setStatus(status);
        salary.setProcessedBy(processedBy);
        return salary;
    }

    private List<Attendance> seedAttendance(List<User> users) {
        List<Attendance> attendances = new ArrayList<>();
        User employee1 = users.get(6);

        attendances.add(createAttendance(employee1, LocalDate.now().minusDays(2),
                LocalDateTime.now().minusDays(2).withHour(9).withMinute(0),
                LocalDateTime.now().minusDays(2).withHour(17).withMinute(0), new BigDecimal("8.00")));
        
        return attendanceRepository.saveAll(attendances);
    }

    private Attendance createAttendance(User employee, LocalDate date, LocalDateTime in, LocalDateTime out,
                                        BigDecimal hours) {
        Attendance attendance = new Attendance();
        attendance.setEmployee(employee);
        attendance.setDate(date);
        attendance.setCheckInTime(in);
        attendance.setCheckOutTime(out);
        attendance.setTotalHours(hours);
        return attendance;
    }

    private void seedV2Data() {
        if (diplomaV2Repository.count() > 0) return;

        List<DiplomaV2> diplomas = new ArrayList<>();
        diplomas.add(new DiplomaV2("BIM Architecture diploma"));
        diplomas.add(new DiplomaV2("Interior Design & Decoration - Offline"));
        diplomas.add(new DiplomaV2("Interior Design & Decoration - Online"));
        diplomas.add(new DiplomaV2("Full Stack Development"));
        diplomas = diplomaV2Repository.saveAll(diplomas);

        RoundV2 round9 = new RoundV2();
        round9.setName("Round 9");
        round9.setStartDate(LocalDate.of(2026, 4, 12));
        round9.setEndDate(LocalDate.of(2026, 8, 12));
        round9.setDiplomas(new HashSet<>(diplomas.subList(0, 3)));
        roundV2Repository.save(round9);

        RoundV2 round10 = new RoundV2();
        round10.setName("Round 10");
        round10.setStartDate(LocalDate.of(2026, 5, 20));
        round10.setEndDate(LocalDate.of(2026, 9, 20));
        round10.setDiplomas(new HashSet<>(List.of(diplomas.get(3))));
        roundV2Repository.save(round10);

        // Seed Instructors V2
        if (instructorV2Repository.count() == 0) {
            InstructorV2 inst1 = new InstructorV2();
            inst1.setName("Eng. Mohamed Saleh");
            inst1.setPhoneNumber("01127268622");
            inst1.setSalary(18000.0);
            inst1.setPaymentMethod("Cash");
            inst1.setAssignedDiplomas(new HashSet<>(diplomas.subList(0, 1)));
            instructorV2Repository.save(inst1);

            InstructorV2 inst2 = new InstructorV2();
            inst2.setName("Ms. Nermin Adel");
            inst2.setPhoneNumber("01127268622");
            inst2.setSalary(18000.0);
            inst2.setPaymentMethod("Cash");
            inst2.setAssignedDiplomas(new HashSet<>(diplomas.subList(1, 2)));
            instructorV2Repository.save(inst2);

            InstructorV2 inst3 = new InstructorV2();
            inst3.setName("Eng. Karim Mostafa");
            inst3.setPhoneNumber("01127268622");
            inst3.setSalary(18000.0);
            inst3.setPaymentMethod("Cash");
            inst3.setAssignedDiplomas(new HashSet<>(diplomas.subList(2, 3)));
            instructorV2Repository.save(inst3);
        }
    }
}
