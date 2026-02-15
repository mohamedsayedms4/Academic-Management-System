package org.example.academicmanagementsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.academicmanagementsystem.model.Lead;
import org.example.academicmanagementsystem.model.LeadStatus;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.LeadRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final LeadRepository leadRepository;
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

            log.info("Database seeding completed successfully!");
        };
    }

    private List<User> seedUsers() {
        List<User> users = new ArrayList<>();

        // Admin User
        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@academic.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("أحمد محمود");
        admin.setRole(UserRole.ADMIN);
        users.add(userRepository.save(admin));

        // Moderator User
        User moderator = new User();
        moderator.setUsername("moderator");
        moderator.setEmail("moderator@academic.com");
        moderator.setPassword(passwordEncoder.encode("moderator123"));
        moderator.setFullName("سارة علي");
        moderator.setRole(UserRole.MODERATOR);
        users.add(userRepository.save(moderator));

        // TeleSales Users
        User telesales1 = new User();
        telesales1.setUsername("telesales1");
        telesales1.setEmail("telesales1@academic.com");
        telesales1.setPassword(passwordEncoder.encode("telesales123"));
        telesales1.setFullName("محمد أحمد");
        telesales1.setRole(UserRole.TELESALES);
        users.add(userRepository.save(telesales1));

        User telesales2 = new User();
        telesales2.setUsername("telesales2");
        telesales2.setEmail("telesales2@academic.com");
        telesales2.setPassword(passwordEncoder.encode("telesales123"));
        telesales2.setFullName("فاطمة حسن");
        telesales2.setRole(UserRole.TELESALES);
        users.add(userRepository.save(telesales2));

        User telesales3 = new User();
        telesales3.setUsername("telesales3");
        telesales3.setEmail("telesales3@academic.com");
        telesales3.setPassword(passwordEncoder.encode("telesales123"));
        telesales3.setFullName("عمر خالد");
        telesales3.setRole(UserRole.TELESALES);
        users.add(userRepository.save(telesales3));

        // Accountant User
        User accountant = new User();
        accountant.setUsername("accountant");
        accountant.setEmail("accountant@academic.com");
        accountant.setPassword(passwordEncoder.encode("accountant123"));
        accountant.setFullName("نور الدين");
        accountant.setRole(UserRole.ACCOUNTANT);
        users.add(userRepository.save(accountant));

        // Employee User
        User employee = new User();
        employee.setUsername("employee");
        employee.setEmail("employee@academic.com");
        employee.setPassword(passwordEncoder.encode("employee123"));
        employee.setFullName("ليلى يوسف");
        employee.setRole(UserRole.EMPLOYEE);
        users.add(userRepository.save(employee));

        return users;
    }

    private List<Lead> seedLeads(List<User> users) {
        List<Lead> leads = new ArrayList<>();

        // Get telesales users (indices 2, 3, 4)
        User telesales1 = users.get(2);
        User telesales2 = users.get(3);
        User telesales3 = users.get(4);

        // Lead 1 - OPEN with telesales1
        Lead lead1 = new Lead();
        lead1.setPhoneNumber("01234567890");
        lead1.setDiplomaName("Computer Science Diploma");
        lead1.setModeratorNotes("Very interested in AI and Machine Learning courses");
        lead1.setStatus(LeadStatus.OPEN);
        lead1.setTeleSales(telesales1);
        leads.add(leadRepository.save(lead1));

        // Lead 2 - OPEN with telesales2
        Lead lead2 = new Lead();
        lead2.setPhoneNumber("01123456789");
        lead2.setDiplomaName("Data Science Diploma");
        lead2.setModeratorNotes("Looking for evening classes");
        lead2.setStatus(LeadStatus.OPEN);
        lead2.setTeleSales(telesales2);
        leads.add(leadRepository.save(lead2));

        // Lead 3 - OPEN with telesales1
        Lead lead3 = new Lead();
        lead3.setPhoneNumber("01098765432");
        lead3.setDiplomaName("Web Development Diploma");
        lead3.setModeratorNotes("Referred from social media campaign");
        lead3.setStatus(LeadStatus.OPEN);
        lead3.setTeleSales(telesales1);
        leads.add(leadRepository.save(lead3));

        // Lead 4 - CLOSED (Successfully enrolled)
        Lead lead4 = new Lead();
        lead4.setPhoneNumber("01156789012");
        lead4.setDiplomaName("Mobile App Development");
        lead4.setModeratorNotes("Completed enrollment process");
        lead4.setStatus(LeadStatus.CLOSED);
        lead4.setClosureReason("Successfully enrolled in Spring 2026 semester");
        lead4.setTeleSales(telesales3);
        leads.add(leadRepository.save(lead4));

        // Lead 5 - CLOSED (Not interested)
        Lead lead5 = new Lead();
        lead5.setPhoneNumber("01087654321");
        lead5.setDiplomaName("Cybersecurity Diploma");
        lead5.setModeratorNotes("Called multiple times, not responding");
        lead5.setStatus(LeadStatus.CLOSED);
        lead5.setClosureReason("Not interested after follow-up calls");
        lead5.setTeleSales(telesales2);
        leads.add(leadRepository.save(lead5));

        // Lead 6 - OPEN without telesales (pending assignment)
        Lead lead6 = new Lead();
        lead6.setPhoneNumber("01234098765");
        lead6.setDiplomaName("Digital Marketing Diploma");
        lead6.setModeratorNotes("New lead from website form");
        lead6.setStatus(LeadStatus.OPEN);
        leads.add(leadRepository.save(lead6));

        // Lead 7 - OPEN with telesales3
        Lead lead7 = new Lead();
        lead7.setPhoneNumber("01145678901");
        lead7.setDiplomaName("Full Stack Development");
        lead7.setModeratorNotes("Interested in weekend batches");
        lead7.setStatus(LeadStatus.OPEN);
        lead7.setTeleSales(telesales3);
        leads.add(leadRepository.save(lead7));

        // Lead 8 - OPEN without telesales (pending)
        Lead lead8 = new Lead();
        lead8.setPhoneNumber("01298765430");
        lead8.setDiplomaName("UI/UX Design Diploma");
        lead8.setModeratorNotes("Requires more information about fees");
        lead8.setStatus(LeadStatus.OPEN);
        leads.add(leadRepository.save(lead8));

        // Lead 9 - CLOSED (Budget constraints)
        Lead lead9 = new Lead();
        lead9.setPhoneNumber("01076543210");
        lead9.setDiplomaName("Cloud Computing Diploma");
        lead9.setModeratorNotes("Interested but cannot afford fees currently");
        lead9.setStatus(LeadStatus.CLOSED);
        lead9.setClosureReason("Budget constraints - may re-engage next quarter");
        lead9.setTeleSales(telesales1);
        leads.add(leadRepository.save(lead9));

        // Lead 10 - OPEN with telesales2
        Lead lead10 = new Lead();
        lead10.setPhoneNumber("01187654098");
        lead10.setDiplomaName("Business Analytics Diploma");
        lead10.setModeratorNotes("Corporate referral - priority lead");
        lead10.setStatus(LeadStatus.OPEN);
        lead10.setTeleSales(telesales2);
        leads.add(leadRepository.save(lead10));

        // Lead 11 - OPEN without telesales
        Lead lead11 = new Lead();
        lead11.setPhoneNumber("01234567654");
        lead11.setDiplomaName("DevOps Engineering");
        lead11.setModeratorNotes("Hot lead - needs immediate follow-up");
        lead11.setStatus(LeadStatus.OPEN);
        leads.add(leadRepository.save(lead11));

        // Lead 12 - CLOSED (Successfully enrolled)
        Lead lead12 = new Lead();
        lead12.setPhoneNumber("01123987654");
        lead12.setDiplomaName("Artificial Intelligence Diploma");
        lead12.setModeratorNotes("Enrolled with scholarship");
        lead12.setStatus(LeadStatus.CLOSED);
        lead12.setClosureReason("Enrolled successfully - 50% scholarship approved");
        lead12.setTeleSales(telesales3);
        leads.add(leadRepository.save(lead12));

        return leads;
    }
}
