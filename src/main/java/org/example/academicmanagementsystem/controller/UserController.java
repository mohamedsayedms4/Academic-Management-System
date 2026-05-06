package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.UserResponse;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.mapper.UserMapper;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/role/{role}")
    public List<UserResponse> getUsersByRole(@PathVariable UserRole role) {
        return userRepository.findByRole(role).stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(userMapper::toUserResponse)
                .collect(Collectors.toList());
    }
}
