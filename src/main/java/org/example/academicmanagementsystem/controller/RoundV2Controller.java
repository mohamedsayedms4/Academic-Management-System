package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.RoundRequestV2;
import org.example.academicmanagementsystem.dto.RoundResponseV2;
import org.example.academicmanagementsystem.service.RoundV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v2/rounds")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoundV2Controller {

    private final RoundV2Service roundService;

    @PostMapping
    public ResponseEntity<RoundResponseV2> createRound(@RequestBody RoundRequestV2 request) {
        return ResponseEntity.ok(roundService.createRound(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoundResponseV2> updateRound(@PathVariable Long id, @RequestBody RoundRequestV2 request) {
        return ResponseEntity.ok(roundService.updateRound(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoundResponseV2> getRound(@PathVariable Long id) {
        return ResponseEntity.ok(roundService.getRound(id));
    }

    @GetMapping
    public ResponseEntity<Page<RoundResponseV2>> getAllRounds(Pageable pageable) {
        return ResponseEntity.ok(roundService.getAllRounds(pageable));
    }

    @GetMapping("/all")
    public ResponseEntity<List<RoundResponseV2>> getAllRoundsList() {
        return ResponseEntity.ok(roundService.getAllRoundsList());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRound(@PathVariable Long id) {
        roundService.deleteRound(id);
        return ResponseEntity.noContent().build();
    }
}
