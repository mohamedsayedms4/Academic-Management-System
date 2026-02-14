package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.AuthResponse;
import org.example.academicmanagementsystem.dto.LoginRequest;
import org.example.academicmanagementsystem.dto.RegisterRequest;
import org.example.academicmanagementsystem.dto.UserResponse;
import org.example.academicmanagementsystem.mapper.UserMapper;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.security.JwtTokenProvider;
import org.example.academicmanagementsystem.util.TestDataBuilder;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider tokenProvider;

    @Mock
    private UserMapper userMapper;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthService authService;

    @Test
    void shouldLoginSuccessfully() {
        // Given
        LoginRequest loginRequest = TestDataBuilder.createLoginRequest("admin", "password123");
        User user = TestDataBuilder.createAdminUser();
        String expectedToken = "test.jwt.token";

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(tokenProvider.generateToken(authentication)).thenReturn(expectedToken);
        when(tokenProvider.getExpirationTime()).thenReturn(3600000L);
        when(authentication.getPrincipal()).thenReturn(UserDetailsImpl.build(user));

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo(expectedToken);
        assertThat(response.getType()).isEqualTo("Bearer");
        assertThat(response.getUsername()).isEqualTo("admin");
        assertThat(response.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(response.getExpiresIn()).isEqualTo(3600000L);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider).generateToken(authentication);
    }

    @Test
    void shouldThrowExceptionWhenLoginWithInvalidCredentials() {
        // Given
        LoginRequest loginRequest = TestDataBuilder.createLoginRequest("admin", "wrongpassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        // When & Then
        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessage("Bad credentials");

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(tokenProvider, never()).generateToken(any());
    }

    @Test
    void shouldRegisterUserSuccessfully() {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.TELESALES);
        User savedUser = TestDataBuilder.createTestUser("newuser", UserRole.TELESALES);
        savedUser.setId(2L);
        UserResponse expectedResponse = UserResponse.builder()
                .id(2L)
                .username("newuser")
                .fullName("Test User")
                .role(UserRole.TELESALES)
                .active(true)
                .build();

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userMapper.toUserResponse(any(User.class))).thenReturn(expectedResponse);

        // When
        UserResponse response = authService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(2L);
        assertThat(response.getUsername()).isEqualTo("newuser");
        assertThat(response.getRole()).isEqualTo(UserRole.TELESALES);
        assertThat(response.getActive()).isTrue();

        verify(userRepository).existsByUsername("newuser");
        verify(userRepository).existsByEmail("newuser@test.com");
        verify(passwordEncoder).encode("password123");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisterWithDuplicateUsername() {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("existinguser", UserRole.EMPLOYEE);

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Username is already taken");

        verify(userRepository).existsByUsername("existinguser");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisterWithDuplicateEmail() {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.EMPLOYEE);

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail("newuser@test.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Email is already in use");

        verify(userRepository).existsByUsername("newuser");
        verify(userRepository).existsByEmail("newuser@test.com");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldEncodePasswordWhenRegistering() {
        // Given
        RegisterRequest registerRequest = TestDataBuilder.createRegisterRequest("newuser", UserRole.EMPLOYEE);
        String rawPassword = "password123";
        String encodedPassword = "$2a$10$encoded.password.hash";

        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(rawPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userMapper.toUserResponse(any(User.class))).thenReturn(new UserResponse());

        // When
        authService.register(registerRequest);

        // Then
        verify(passwordEncoder).encode(rawPassword);
        verify(userRepository).save(argThat(user -> user.getPassword().equals(encodedPassword)));
    }
}
