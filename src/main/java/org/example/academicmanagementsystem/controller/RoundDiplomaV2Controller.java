package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundDiplomaV2Request;
import org.example.academicmanagementsystem.dto.RoundDiplomaV2Response;
import org.example.academicmanagementsystem.service.RoundDiplomaV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/round-diplomas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoundDiplomaV2Controller {

    private final RoundDiplomaV2Service roundDiplomaService;

    @PostMapping
    public ResponseEntity<RoundDiplomaV2Response> createDiploma(@RequestBody RoundDiplomaV2Request request) {
        return ResponseEntity.ok(roundDiplomaService.createDiploma(request));
    }

    @GetMapping
    public ResponseEntity<Page<RoundDiplomaV2Response>> getDiplomas(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(roundDiplomaService.getDiplomas(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoundDiplomaV2Response> getDiplomaById(@PathVariable Long id) {
        return ResponseEntity.ok(roundDiplomaService.getDiplomaById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoundDiplomaV2Response> updateDiploma(
            @PathVariable Long id,
            @RequestBody RoundDiplomaV2Request request) {
        return ResponseEntity.ok(roundDiplomaService.updateDiploma(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiploma(@PathVariable Long id) {
        roundDiplomaService.deleteDiploma(id);
        return ResponseEntity.noContent().build();
    }
}
