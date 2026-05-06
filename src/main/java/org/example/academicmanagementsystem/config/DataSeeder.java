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
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
    private final RoundRepository roundRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final TaskRepository taskRepository;
    private final ComplaintRepository complaintRepository;
    private final SalaryRepository salaryRepository;
    private final FollowUpRepository followUpRepository;
    private final AttendanceRepository attendanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            // Check if data already exists
            if (userRepository.count() > 0) {
                log.info("Database already contains data. Skipping seeding.");
                return;
            }

            log.info("Starting database seeding...");

            // Seed Users
            List<User> users = seedUsers();
            log.info("Seeded {} users", users.size());

            // Seed Leads
            List<Lead> leads = seedLeads(users);
            log.info("Seeded {} leads", leads.size());

            // Seed FollowUps
            List<FollowUp> followUps = seedFollowUps(leads);
            log.info("Seeded {} follow-ups", followUps.size());

            // Seed Rounds
            List<Round> rounds = seedRounds();
            log.info("Seeded {} rounds", rounds.size());

            // Seed Students
            List<Student> students = seedStudents(rounds);
            log.info("Seeded {} students", students.size());

            // Seed Payments
            List<Payment> payments = seedPayments(students, users);
            log.info("Seeded {} payments", payments.size());

            // Seed Tasks
            List<Task> tasks = seedTasks(users);
            log.info("Seeded {} tasks", tasks.size());

            // Seed Complaints
            List<Complaint> complaints = seedComplaints(students, users);
            log.info("Seeded {} complaints", complaints.size());

            // Seed Salaries
            List<Salary> salaries = seedSalaries(users);
            log.info("Seeded {} salaries", salaries.size());

            // Seed Attendance
            List<Attendance> attendances = seedAttendance(users);
            log.info("Seeded {} attendance records", attendances.size());

            log.info("Database seeding completed successfully!");
        };
    }

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();

        // Admin User
        User admin = createUser("admin", "admin@academic.com", "admin123", "أحمد محمود", UserRole.ADMIN);
        users.add(userRepository.save(admin));

        // Moderator User
        User moderator = createUser("moderator", "moderator@academic.com", "moderator123", "سارة علي",
                UserRole.MODERATOR);
        users.add(userRepository.save(moderator));

        // TeleSales Users
        User telesales1 = createUser("telesales1", "telesales1@academic.com", "telesales123", "محمد أحمد",
                UserRole.TELESALES);
        users.add(userRepository.save(telesales1));

        User telesales2 = createUser("telesales2", "telesales2@academic.com", "telesales123", "فاطمة حسن",
                UserRole.TELESALES);
        users.add(userRepository.save(telesales2));

        User telesales3 = createUser("telesales3", "telesales3@academic.com", "telesales123", "عمر خالد",
                UserRole.TELESALES);
        users.add(userRepository.save(telesales3));

        // Accountant User
        User accountant = createUser("accountant", "accountant@academic.com", "accountant123", "نور الدين",
                UserRole.ACCOUNTANT);
        users.add(userRepository.save(accountant));

        // Employee Members (Instructors/Staff)
        User employee1 = createUser("employee1", "employee1@academic.com", "employee123", "ليلى يوسف",
                UserRole.EMPLOYEE);
        users.add(userRepository.save(employee1));

        User employee2 = createUser("employee2", "employee2@academic.com", "employee123", "كريم عادل",
                UserRole.EMPLOYEE);
        users.add(userRepository.save(employee2));

        return users;
    }

    private User createUser(String username, String email, String password, String fullName, UserRole role) {
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setRole(role);
        return user;
    }

    private List<Lead> seedLeads(List<User> users) {
        List<Lead> leads = new ArrayList<>();

        // Get telesales users (indices 2, 3, 4)
        User telesales1 = users.get(2);
        User telesales2 = users.get(3);
        User telesales3 = users.get(4);

        leads.add(createLead("01234567890", "Computer Science Diploma", "Very interested in AI", LeadStatus.OPEN,
                telesales1, null, null));
        leads.add(createLead("01123456789", "Data Science Diploma", "Looking for evening classes", LeadStatus.OPEN,
                telesales2, null, null));
        leads.add(createLead("01098765432", "Web Development Diploma", "Referred from social media", LeadStatus.OPEN,
                telesales1, null, null));
        leads.add(createLead("01156789012", "Mobile App Development", "Completed enrollment process", LeadStatus.CLOSED,
                telesales3, "Successfully enrolled", null));
        leads.add(createLead("01087654321", "Cybersecurity Diploma", "Called multiple times, no answer",
                LeadStatus.CLOSED, telesales2, "Not interested", null));
        leads.add(createLead("01234098765", "Digital Marketing Diploma", "New lead from website", LeadStatus.OPEN, null,
                null, null)); // Unassigned
        leads.add(createLead("01145678901", "Full Stack Development", "Interested in weekend batches", LeadStatus.OPEN,
                telesales3, null, null));
        leads.add(createLead("01298765430", "UI/UX Design Diploma", "Requires more info on fees", LeadStatus.OPEN, null,
                null, null)); // Unassigned
        leads.add(createLead("01076543210", "Cloud Computing Diploma", "Cannot afford currently", LeadStatus.CLOSED,
                telesales1, "Budget constraints", null));
        leads.add(createLead("01187654098", "Business Analytics Diploma", "Corporate referral", LeadStatus.OPEN,
                telesales2, null, null));
        leads.add(createLead("01234567654", "DevOps Engineering", "Hot lead", LeadStatus.OPEN, null, null, null)); // Unassigned
        leads.add(createLead("01123987654", "Artificial Intelligence Diploma", "Enrolled with scholarship",
                LeadStatus.CLOSED, telesales3, "Enrolled", null));

        return leadRepository.saveAll(leads);
    }

    private Lead createLead(String phone, String diploma, String notes, LeadStatus status, User telesales,
            String closureReason, String email) {
        Lead lead = new Lead();
        lead.setPhoneNumber(phone);
        lead.setDiplomaName(diploma);
        lead.setModeratorNotes(notes);
        lead.setStatus(status);
        lead.setTeleSales(telesales);
        lead.setClosureReason(closureReason);
        // lead.setEmail(email); // If Lead has email field
        return lead;
    }

    private List<FollowUp> seedFollowUps(List<Lead> leads) {
        List<FollowUp> followUps = new ArrayList<>();

        // Follow-ups for active leads
        followUps.add(createFollowUp(leads.get(0), 1, "Initial contact made. Interested in curriculum details."));
        followUps.add(createFollowUp(leads.get(0), 2, "Sent brochure via WhatsApp. Waiting for reply."));

        followUps.add(createFollowUp(leads.get(1), 1, "discussed schedule options. Prefers 6 PM slots."));

        followUps.add(createFollowUp(leads.get(6), 1, "Called, no answer. Left a message."));
        followUps.add(createFollowUp(leads.get(6), 2, "Called again, spoke briefly. Requested callback next week."));

        return followUpRepository.saveAll(followUps);
    }

    private FollowUp createFollowUp(Lead lead, int sequence, String message) {
        FollowUp followUp = new FollowUp();
        followUp.setLead(lead);
        followUp.setSequence(sequence);
        followUp.setMessage(message);
        return followUp;
    }

    private List<Round> seedRounds() {
        List<Round> rounds = new ArrayList<>();

        rounds.add(createRound("Round 1 - Full Stack", LocalDate.now().minusMonths(3), LocalDate.now().plusMonths(3),
                "Full Stack Development", 30, 25, new BigDecimal("5000.00"), RoundStatus.ACTIVE));
        rounds.add(createRound("Round 2 - Data Science", LocalDate.now().minusMonths(1), LocalDate.now().plusMonths(5),
                "Data Science Diploma", 25, 20, new BigDecimal("6000.00"), RoundStatus.ACTIVE));
        rounds.add(
                createRound("Round 3 - Digital Marketing", LocalDate.now().minusWeeks(2), LocalDate.now().plusMonths(2),
                        "Digital Marketing Diploma", 40, 15, new BigDecimal("3500.00"), RoundStatus.ACTIVE));
        rounds.add(createRound("Round 4 - Cybersecurity", LocalDate.now().plusMonths(1), LocalDate.now().plusMonths(7),
                "Cybersecurity Diploma", 20, 5, new BigDecimal("7000.00"), RoundStatus.ACTIVE));
        rounds.add(createRound("Round 0 - Legacy Java", LocalDate.now().minusYears(1), LocalDate.now().minusMonths(6),
                "Java Development", 30, 28, new BigDecimal("4500.00"), RoundStatus.COMPLETED));

        return roundRepository.saveAll(rounds);
    }

    private Round createRound(String name, LocalDate start, LocalDate end, String diploma, int capacity, int current,
            BigDecimal installment, RoundStatus status) {
        Round round = new Round();
        round.setName(name);
        round.setStartDate(start);
        round.setEndDate(end);
        round.setDiplomaName(diploma);
        round.setTotalStudents(capacity);
        round.setCurrentEnrollment(current);
        round.setInstallmentAmount(installment);
        round.setStatus(status);
        return round;
    }

    private List<Student> seedStudents(List<Round> rounds) {
        List<Student> students = new ArrayList<>();
        Round round1 = rounds.get(0); // Full Stack
        Round round2 = rounds.get(1); // Data Science

        // Students in Round 1
        students.add(createStudent("Ahmed Hassan", "01011111111", "ahmed.h@example.com", round1,
                new BigDecimal("15000.00"), new BigDecimal("5000.00"), new BigDecimal("10000.00"),
                PaymentStatus.PARTIAL, LocalDate.now().minusMonths(3)));
        students.add(createStudent("Mariam Ezzat", "01022222222", "mariam.e@example.com", round1,
                new BigDecimal("15000.00"), new BigDecimal("15000.00"), BigDecimal.ZERO, PaymentStatus.PAID,
                LocalDate.now().minusMonths(3)));
        students.add(createStudent("Youssef Nabil", "01033333333", "youssef.n@example.com", round1,
                new BigDecimal("15000.00"), BigDecimal.ZERO, new BigDecimal("15000.00"), PaymentStatus.PENDING,
                LocalDate.now().minusMonths(2)));

        // Students in Round 2
        students.add(createStudent("Sara Mahmoud", "01144444444", "sara.m@example.com", round2,
                new BigDecimal("18000.00"), new BigDecimal("6000.00"), new BigDecimal("12000.00"),
                PaymentStatus.PARTIAL, LocalDate.now().minusMonths(1)));
        students.add(createStudent("Karim Wael", "01155555555", "karim.w@example.com", round2,
                new BigDecimal("18000.00"), new BigDecimal("18000.00"), BigDecimal.ZERO, PaymentStatus.PAID,
                LocalDate.now().minusMonths(1)));

        return studentRepository.saveAll(students);
    }

    private Student createStudent(String name, String phone, String email, Round round, BigDecimal totalFees,
            BigDecimal paid, BigDecimal remaining, PaymentStatus status, LocalDate enrollmentDate) {
        Student student = new Student();
        student.setName(name);
        student.setPhone(phone);
        student.setEmail(email);
        student.setRound(round);
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

        // Ahmed Hassan paid 1st installment
        payments.add(createPayment(students.get(0), new BigDecimal("5000.00"), LocalDateTime.now().minusMonths(3),
                PaymentType.INSTALLMENT, PaymentMethod.CASH, "RCP-001", "First Installment", 1, accountant));

        // Mariam Ezzat paid full
        payments.add(createPayment(students.get(1), new BigDecimal("15000.00"), LocalDateTime.now().minusMonths(3),
                PaymentType.FULL, PaymentMethod.BANK_TRANSFER, "RCP-002", "Full Course Payment", null,
                accountant));

        // Sara Mahmoud paid 1st installment
        payments.add(createPayment(students.get(3), new BigDecimal("6000.00"), LocalDateTime.now().minusMonths(1),
                PaymentType.INSTALLMENT, PaymentMethod.CARD, "RCP-003", "First Installment", 1, accountant));

        // Karim Wael paid full
        payments.add(createPayment(students.get(4), new BigDecimal("18000.00"), LocalDateTime.now().minusMonths(1),
                PaymentType.FULL, PaymentMethod.CASH, "RCP-004", "Full Payment Discount applied", null,
                accountant));

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
            payment.setInstallmentNumber(null); // Full payment doesn't have an installment number
        }
        if (processedBy != null) {
            payment.setProcessedAt(LocalDateTime.now());
        }
        return payment;
    }

    private List<Task> seedTasks(List<User> users) {
        List<Task> tasks = new ArrayList<>();
        User admin = users.get(0); // Admin
        User telesales1 = users.get(2);
        User employee1 = users.get(6); // First employee

        tasks.add(createTask("Follow up with new leads", "Call the 5 new leads assigned today", telesales1, admin,
                TaskStatus.PENDING, TaskPriority.HIGH, LocalDateTime.now().plusDays(1)));
        tasks.add(createTask("Prepare Monthly Report", "Compile sales data for January", admin, admin,
                TaskStatus.IN_PROGRESS, TaskPriority.MEDIUM, LocalDateTime.now().plusDays(2)));
        tasks.add(createTask("Update Course Material", "Review and update slides for Round 1", employee1, admin,
                TaskStatus.PENDING, TaskPriority.LOW, LocalDateTime.now().plusDays(5)));
        tasks.add(createTask("Fix Projector Issues", "Room 3 projector is flickering", employee1, admin,
                TaskStatus.DONE, TaskPriority.HIGH, LocalDateTime.now().minusDays(1)));

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
        if (status == TaskStatus.DONE) {
            task.setCompletionNotes("Done successfully");
        }
        return task;
    }

    private List<Complaint> seedComplaints(List<Student> students, List<User> users) {
        List<Complaint> complaints = new ArrayList<>();
        User moderator = users.get(1);

        complaints.add(createComplaint(students.get(0), "Ahmed Hassan", "01011111111", "AC is not working in Lab 2",
                ComplaintStatus.OPEN, "COMP-001", null));
        complaints.add(createComplaint(students.get(1), "Mariam Ezzat", "01022222222",
                "Lecture recording for session 3 is missing", ComplaintStatus.CLOSED, "COMP-002", moderator));

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
        if (status == ComplaintStatus.CLOSED) {
            complaint.setResponseText("Issue has been fixed.");
            complaint.setResolvedAt(LocalDateTime.now());
        }
        return complaint;
    }

    private List<Salary> seedSalaries(List<User> users) {
        List<Salary> salaries = new ArrayList<>();
        User accountant = users.stream().filter(u -> u.getRole() == UserRole.ACCOUNTANT).findFirst()
                .orElse(users.get(0));
        User employee1 = users.get(6);
        User employee2 = users.get(7);

        salaries.add(createSalary(employee1, "2026-01", new BigDecimal("8000.00"), BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("8000.00"), SalaryStatus.PAID, accountant));
        salaries.add(createSalary(employee2, "2026-01", new BigDecimal("7500.00"), new BigDecimal("500.00"),
                BigDecimal.ZERO, new BigDecimal("8000.00"), SalaryStatus.PAID, accountant));
        salaries.add(createSalary(employee1, "2026-02", new BigDecimal("8000.00"), BigDecimal.ZERO,
                new BigDecimal("200.00"), new BigDecimal("7800.00"), SalaryStatus.PENDING, null));

        return salaryRepository.saveAll(salaries);
    }

    private Salary createSalary(User employee, String month, BigDecimal base, BigDecimal bonus, BigDecimal deduction,
            BigDecimal net, SalaryStatus status, User processedBy) {
        Salary salary = new Salary();
        salary.setEmployee(employee);
        salary.setMonth(month);
        salary.setBaseSalary(base);
        salary.setBonuses(bonus);
        salary.setDeductions(deduction);
        salary.setNetSalary(net);
        salary.setStatus(status);
        salary.setProcessedBy(processedBy);
        if (status == SalaryStatus.PAID) {
            salary.setProcessedAt(LocalDateTime.now());
        }
        return salary;
    }

    private List<Attendance> seedAttendance(List<User> users) {
        List<Attendance> attendances = new ArrayList<>();
        User employee1 = users.get(6);

        attendances.add(createAttendance(employee1, LocalDate.now().minusDays(2),
                LocalDateTime.now().minusDays(2).withHour(9).withMinute(0),
                LocalDateTime.now().minusDays(2).withHour(17).withMinute(0), new BigDecimal("8.00")));
        attendances.add(createAttendance(employee1, LocalDate.now().minusDays(1),
                LocalDateTime.now().minusDays(1).withHour(9).withMinute(15),
                LocalDateTime.now().minusDays(1).withHour(17).withMinute(15), new BigDecimal("8.00")));
        attendances.add(createAttendance(employee1, LocalDate.now(), LocalDateTime.now().withHour(8).withMinute(55),
                null, null)); // Checked in today, not out yet

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
}
