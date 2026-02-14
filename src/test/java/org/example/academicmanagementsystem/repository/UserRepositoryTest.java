package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.util.TestDataBuilder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByUsername() {
        // Given
        User user = TestDataBuilder.createAdminUser();
        entityManager.persist(user);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByUsername("admin");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getUsername()).isEqualTo("admin");
        assertThat(found.get().getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    void shouldReturnEmptyWhenUserNotFoundByUsername() {
        // When
        Optional<User> found = userRepository.findByUsername("nonexistent");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void shouldFindUserByEmail() {
        // Given
        User user = TestDataBuilder.createTelesalesUser();
        entityManager.persist(user);
        entityManager.flush();

        // When
        Optional<User> found = userRepository.findByEmail("telesales@test.com");

        // Then
        assertThat(found).isPresent();
        assertThat(found.get().getEmail()).isEqualTo("telesales@test.com");
        assertThat(found.get().getRole()).isEqualTo(UserRole.TELESALES);
    }

    @Test
    void shouldReturnEmptyWhenUserNotFoundByEmail() {
        // When
        Optional<User> found = userRepository.findByEmail("nonexistent@test.com");

        // Then
        assertThat(found).isEmpty();
    }

    @Test
    void shouldReturnTrueWhenUsernameExists() {
        // Given
        User user = TestDataBuilder.createAdminUser();
        entityManager.persist(user);
        entityManager.flush();

        // When
        Boolean exists = userRepository.existsByUsername("admin");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void shouldReturnFalseWhenUsernameDoesNotExist() {
        // When
        Boolean exists = userRepository.existsByUsername("nonexistent");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void shouldReturnTrueWhenEmailExists() {
        // Given
        User user = TestDataBuilder.createTelesalesUser();
        entityManager.persist(user);
        entityManager.flush();

        // When
        Boolean exists = userRepository.existsByEmail("telesales@test.com");

        // Then
        assertThat(exists).isTrue();
    }

    @Test
    void shouldReturnFalseWhenEmailDoesNotExist() {
        // When
        Boolean exists = userRepository.existsByEmail("nonexistent@test.com");

        // Then
        assertThat(exists).isFalse();
    }

    @Test
    void shouldPersistUserWithArabicFullName() {
        // Given
        User user = TestDataBuilder.createTestUserWithArabicName();

        // When
        User saved = userRepository.save(user);
        entityManager.flush();
        User found = userRepository.findByUsername("arabic_user").orElseThrow();

        // Then
        assertThat(found.getFullName()).isEqualTo("أحمد محمد السيد");
    }
}
