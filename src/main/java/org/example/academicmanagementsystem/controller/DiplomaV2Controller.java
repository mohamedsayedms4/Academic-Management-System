package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.DiplomaResponseV2;
import org.example.academicmanagementsystem.model.DiplomaV2;
import org.example.academicmanagementsystem.repository.DiplomaV2Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v2/diplomas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DiplomaV2Controller {

    private final DiplomaV2Repository diplomaRepository;

    @GetMapping
    public ResponseEntity<List<DiplomaResponseV2>> getAllDiplomas() {
        List<DiplomaResponseV2> diplomas = diplomaRepository.findAll().stream()
                .map(d -> DiplomaResponseV2.builder()
                        .id(d.getId())
                        .name(d.getName())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(diplomas);
    }

    @PostMapping
    public ResponseEntity<DiplomaResponseV2> createDiploma(@RequestBody DiplomaResponseV2 request) {
        DiplomaV2 diploma = new DiplomaV2();
        diploma.setName(request.getName());
        DiplomaV2 saved = diplomaRepository.save(diploma);
        return ResponseEntity.ok(DiplomaResponseV2.builder()
                .id(saved.getId())
                .name(saved.getName())
                .build());
    }
}
