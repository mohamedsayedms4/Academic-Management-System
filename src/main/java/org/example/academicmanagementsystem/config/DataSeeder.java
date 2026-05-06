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
    private final RoundDiplomaRepository roundDiplomaRepository;
    private final StudentRepository studentRepository;
    private final PaymentRepository paymentRepository;
    private final TaskRepository taskRepository;
    private final ComplaintRepository complaintRepository;
    private final SalaryRepository salaryRepository;
    private final FollowUpRepository followUpRepository;
    private final DiplomaRepository diplomaRepository;
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

            // Seed Diplomas
            List<Diploma> diplomas = seedDiplomas();
            log.info("Seeded {} diplomas", diplomas.size());

            // Seed Leads
            List<Lead> leads = seedLeads(users, diplomas);
            log.info("Seeded {} leads", leads.size());

            // Seed FollowUps
            List<FollowUp> followUps = seedFollowUps(leads);
            log.info("Seeded {} follow-ups", followUps.size());

            // Seed Rounds and their Diplomas
            List<Round> rounds = seedRounds(diplomas, users);
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

        // Get telesales users (indices 2, 3, 4)
        User telesales1 = users.get(2);
        User telesales2 = users.get(3);
        User telesales3 = users.get(4);

        leads.add(createLead("أحمد محمد", "01234567890", diplomas.get(0), "Very interested in AI", LeadStatus.OPEN,
                telesales1, null, null));
        leads.add(createLead("سارة أحمد", "01123456789", diplomas.get(1), "Looking for evening classes", LeadStatus.OPEN,
                telesales2, null, null));
        leads.add(createLead("فاطمة كمال", "01156789012", diplomas.get(4), "Completed enrollment process", LeadStatus.CLOSED,
                telesales3, "Successfully enrolled", null));
        
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
        User instructor1 = users.get(6); // ليلى يوسف

        // Round 9
        Round round9 = new Round();
        round9.setName("Round 9");
        round9.setStartDate(LocalDate.of(2025, 1, 15));
        round9.setEndDate(LocalDate.of(2025, 7, 15));
        round9.setStatus(RoundStatus.ACTIVE);
        round9 = roundRepository.save(round9);

        List<RoundDiploma> round9Diplomas = new ArrayList<>();
        round9Diplomas.add(createRoundDiploma(round9, diplomas.get(0), instructor1, new BigDecimal("16000.00"), 32,
                new BigDecimal("4000.00"), LocalDate.of(2025, 1, 15), LocalDate.of(2025, 3, 15), LocalDate.of(2025, 5, 15), LocalDate.of(2025, 7, 15)));
        round9Diplomas.add(createRoundDiploma(round9, diplomas.get(1), instructor1, new BigDecimal("14000.00"), 17,
                new BigDecimal("3500.00"), LocalDate.of(2025, 1, 20), LocalDate.of(2025, 3, 20), LocalDate.of(2025, 5, 20), LocalDate.of(2025, 7, 20)));
        
        roundDiplomaRepository.saveAll(round9Diplomas);
        round9.setRoundDiplomas(round9Diplomas);
        rounds.add(round9);

        // Round 10
        Round round10 = new Round();
        round10.setName("Round 10 - Digital Arts");
        round10.setStartDate(LocalDate.of(2025, 3, 1));
        round10.setEndDate(LocalDate.of(2025, 9, 1));
        round10.setStatus(RoundStatus.ACTIVE);
        round10 = roundRepository.save(round10);

        List<RoundDiploma> round10Diplomas = new ArrayList<>();
        round10Diplomas.add(createRoundDiploma(round10, diplomas.get(1), users.get(7), new BigDecimal("15000.00"), 25,
                new BigDecimal("3750.00"), LocalDate.of(2025, 3, 1), LocalDate.of(2025, 5, 1), LocalDate.of(2025, 7, 1), LocalDate.of(2025, 9, 1)));
        round10Diplomas.add(createRoundDiploma(round10, diplomas.get(4), users.get(6), new BigDecimal("12000.00"), 20,
                new BigDecimal("3000.00"), LocalDate.of(2025, 3, 10), LocalDate.of(2025, 5, 10), LocalDate.of(2025, 7, 10), LocalDate.of(2025, 9, 10)));
        
        roundDiplomaRepository.saveAll(round10Diplomas);
        round10.setRoundDiplomas(round10Diplomas);
        rounds.add(round10);

        return rounds;
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

        // Ahmed Hassan paid 1st installment
        payments.add(createPayment(students.get(0), new BigDecimal("4000.00"), LocalDateTime.of(2025, 1, 15, 10, 0),
                PaymentType.INSTALLMENT, PaymentMethod.CASH, "RCP-001", "First Installment", 1, accountant));

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
        User employee1 = users.get(6);

        salaries.add(createSalary(employee1, "2026-01", new BigDecimal("8000.00"), BigDecimal.ZERO, BigDecimal.ZERO,
                new BigDecimal("8000.00"), SalaryStatus.PAID, accountant));
        
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
}
