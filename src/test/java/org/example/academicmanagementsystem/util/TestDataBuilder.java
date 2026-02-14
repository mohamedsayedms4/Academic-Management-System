package org.example.academicmanagementsystem.util;

import org.example.academicmanagementsystem.dto.LoginRequest;
import org.example.academicmanagementsystem.dto.RegisterRequest;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

public class TestDataBuilder {

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static User createTestUser(String username, UserRole role) {
        User user = new User();
        user.setId(1L);
        user.setUsername(username);
        user.setEmail(username + "@test.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setFullName("Test User");
        user.setPhone("01234567890");
        user.setRole(role);
        user.setActive(true);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return user;
    }

    public static User createAdminUser() {
        return createTestUser("admin", UserRole.ADMIN);
    }

    public static User createTelesalesUser() {
        return createTestUser("telesales", UserRole.TELESALES);
    }

    public static User createTestUserWithArabicName() {
        User user = createTestUser("arabic_user", UserRole.EMPLOYEE);
        user.setFullName("أحمد محمد السيد");
        return user;
    }

    public static LoginRequest createLoginRequest(String username, String password) {
        LoginRequest request = new LoginRequest();
        request.setUsername(username);
        request.setPassword(password);
        return request;
    }

    public static RegisterRequest createRegisterRequest(String username, UserRole role) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setEmail(username + "@test.com");
        request.setPassword("password123");
        request.setFullName("Test User");
        request.setPhone("01234567890");
        request.setRole(role);
        return request;
    }

    public static RegisterRequest createRegisterRequestWithArabicName() {
        RegisterRequest request = createRegisterRequest("arabic_user", UserRole.TELESALES);
        request.setFullName("أحمد محمد");
        return request;
    }
}
