package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.InstructorRequestV2;
import org.example.academicmanagementsystem.dto.InstructorResponseV2;
import org.example.academicmanagementsystem.service.InstructorV2Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v2/instructors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InstructorV2Controller {

    private final InstructorV2Service instructorService;

    @PostMapping
    public ResponseEntity<InstructorResponseV2> createInstructor(@RequestBody InstructorRequestV2 request) {
        return ResponseEntity.ok(instructorService.createInstructor(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstructorResponseV2> updateInstructor(@PathVariable Long id, @RequestBody InstructorRequestV2 request) {
        return ResponseEntity.ok(instructorService.updateInstructor(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstructor(@PathVariable Long id) {
        instructorService.deleteInstructor(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstructorResponseV2> getInstructor(@PathVariable Long id) {
        return ResponseEntity.ok(instructorService.getInstructor(id));
    }

    @GetMapping
    public ResponseEntity<Page<InstructorResponseV2>> getAllInstructors(
            Pageable pageable,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(instructorService.getAllInstructors(pageable, search));
    }
}
