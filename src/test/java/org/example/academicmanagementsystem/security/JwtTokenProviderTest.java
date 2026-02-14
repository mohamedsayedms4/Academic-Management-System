package org.example.academicmanagementsystem.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.example.academicmanagementsystem.config.JwtConfig;
import org.example.academicmanagementsystem.util.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtTokenProviderTest {

    @Mock
    private JwtConfig jwtConfig;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private JwtTokenProvider jwtTokenProvider;

    private final String testSecret = "testSecretKeyForJunitTestingPurposesOnly123456789";
    private final Long testExpiration = 3600000L; // 1 hour

    @BeforeEach
    void setUp() {
        when(jwtConfig.getSecret()).thenReturn(testSecret);
        when(jwtConfig.getExpiration()).thenReturn(testExpiration);
    }

    @Test
    void shouldGenerateValidToken() {
        // Given
        UserDetailsImpl userDetails = UserDetailsImpl.build(TestDataBuilder.createAdminUser());
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // When
        String token = jwtTokenProvider.generateToken(authentication);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    void shouldExtractUsernameFromToken() {
        // Given
        UserDetailsImpl userDetails = UserDetailsImpl.build(TestDataBuilder.createAdminUser());
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtTokenProvider.generateToken(authentication);

        // When
        String username = jwtTokenProvider.getUsernameFromToken(token);

        // Then
        assertThat(username).isEqualTo("admin");
    }

    @Test
    void shouldValidateValidToken() {
        // Given
        UserDetailsImpl userDetails = UserDetailsImpl.build(TestDataBuilder.createAdminUser());
        when(authentication.getPrincipal()).thenReturn(userDetails);
        String token = jwtTokenProvider.generateToken(authentication);

        // When
        boolean isValid = jwtTokenProvider.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldRejectMalformedToken() {
        // Given
        String malformedToken = "this.is.invalid.token";

        // When
        boolean isValid = jwtTokenProvider.validateToken(malformedToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldRejectExpiredToken() {
        // Given - create an expired token
        SecretKey key = Keys.hmacShaKeyFor(testSecret.getBytes(StandardCharsets.UTF_8));
        String expiredToken = Jwts.builder()
                .subject("admin")
                .issuedAt(new Date(System.currentTimeMillis() - 7200000)) // 2 hours ago
                .expiration(new Date(System.currentTimeMillis() - 3600000)) // expired 1 hour ago
                .signWith(key)
                .compact();

        // When
        boolean isValid = jwtTokenProvider.validateToken(expiredToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldReturnExpirationTime() {
        // When
        Long expirationTime = jwtTokenProvider.getExpirationTime();

        // Then
        assertThat(expirationTime).isEqualTo(testExpiration);
    }
}
