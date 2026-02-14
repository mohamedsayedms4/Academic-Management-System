package org.example.academicmanagementsystem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.academicmanagementsystem.dto.LoginRequest;
import org.example.academicmanagementsystem.dto.RegisterRequest;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.security.JwtTokenProvider;
import org.example.academicmanagementsystem.security.UserDetailsImpl;
import org.example.academicmanagementsystem.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private User telesalesUser;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // Clean database
        userRepository.deleteAll();

        // Create admin user
        adminUser = TestDataBuilder.createAdminUser();
        adminUser.setPassword(passwordEncoder.encode("password123"));
        adminUser = userRepository.save(adminUser);

        // Create telesales user
        telesalesUser = TestDataBuilder.createTelesalesUser();
        telesalesUser.setPassword(passwordEncoder.encode("password123"));
        telesalesUser = userRepository.save(telesalesUser);

        // Generate admin token for protected endpoints
        Authentication auth = new UsernamePasswordAuthenticationToken(
                UserDetailsImpl.build(adminUser), null, UserDetailsImpl.build(adminUser).getAuthorities());
        adminToken = jwtTokenProvider.generateToken(auth);
    }

    @Test
    void shouldLoginSuccessfullyWithValidCredentials() throws Exception {
        // Given
        LoginRequest loginRequest = TestDataBuilder.createLoginRequest("admin", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.type", is("Bearer")))
                .andExpect(jsonPath("$.username", is("admin")))
                .andExpect(jsonPath("$.role", is("ADMIN")))
                .andExpect(jsonPath("$.expiresIn", notNullValue()));
    }

    @Test
    void shouldReturnUnauthorizedWithInvalidPassword() throws Exception {
        // Given
        LoginRequest loginRequest = TestDataBuilder.createLoginRequest("admin", "wrongpassword");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnUnauthorizedWithNonExistentUser() throws Exception {
        // Given
        LoginRequest loginRequest = TestDataBuilder.createLoginRequest("nonexistent", "password123");

        // When & Then
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRegisterUserSuccessfullyWithAdminToken() throws Exception {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.EMPLOYEE);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.username", is("newuser")))
                .andExpect(jsonPath("$.fullName", is("Test User")))
                .andExpect(jsonPath("$.role", is("EMPLOYEE")))
                .andExpect(jsonPath("$.active", is(true)));
    }

    @Test
    void shouldReturnUnauthorizedWhenRegisterWithoutToken() throws Exception {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.EMPLOYEE);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturnForbiddenWhenRegisterWithNonAdminToken() throws Exception {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.EMPLOYEE);

        // Create token for non-admin user
        Authentication auth = new UsernamePasswordAuthenticationToken(
                UserDetailsImpl.build(telesalesUser), null, UserDetailsImpl.build(telesalesUser).getAuthorities());
        String telesalesToken = jwtTokenProvider.generateToken(auth);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .header("Authorization", "Bearer " + telesalesToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldHandleArabicCharactersInFullName() throws Exception {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequestWithArabicName();

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fullName", is("أحمد محمد")));
    }

    @Test
    void shouldReturnErrorWhenRegisterWithDuplicateUsername() throws Exception {
        // Given - username already exists (admin)
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("admin", UserRole.EMPLOYEE);

        // When & Then
        mockMvc.perform(post("/api/auth/register")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().is5xxServerError());
    }

    @Test
    void shouldLogoutSuccessfully() throws Exception {
        // When & Then
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk());
    }
}
