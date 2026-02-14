package org.example.academicmanagementsystem.security;

import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User adminUser;
    private String adminToken;

    @BeforeEach
    void setUp() {
        // Clean database
        userRepository.deleteAll();

        // Create admin user
        adminUser = TestDataBuilder.createAdminUser();
        adminUser.setPassword(passwordEncoder.encode("password123"));
        adminUser = userRepository.save(adminUser);

        // Generate admin token
        Authentication auth = new UsernamePasswordAuthenticationToken(
                UserDetailsImpl.build(adminUser), null, UserDetailsImpl.build(adminUser).getAuthorities());
        adminToken = jwtTokenProvider.generateToken(auth);
    }

    @Test
    void shouldAllowAccessToPublicEndpoints() throws Exception {
        // Login endpoint is public
        mockMvc.perform(get("/api/auth/login"))
                .andExpect(status().isMethodNotAllowed()); // GET not allowed, but not 401
    }

    @Test
    void shouldDenyAccessToProtectedEndpointsWithoutToken() throws Exception {
        // Any endpoint except /api/auth/login and /api/auth/logout should require
        // authentication
        mockMvc.perform(get("/api/auth/register"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAccessWithValidToken() throws Exception {
        // This test verifies that JWT filter properly sets authentication
        // Note: We're testing the filter, actual endpoint may return 405 or 404
        mockMvc.perform(get("/api/auth/register")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isMethodNotAllowed()); // Not 401, authentication succeeded
    }

    @Test
    void shouldDenyAccessWithInvalidToken() throws Exception {
        mockMvc.perform(get("/api/auth/register")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDenyAccessWithMalformedAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/auth/register")
                .header("Authorization", "InvalidFormat"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldDenyAccessWithoutAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/api/auth/register"))
                .andExpect(status().isUnauthorized());
    }
}
