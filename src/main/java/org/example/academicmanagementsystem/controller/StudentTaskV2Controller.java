package org.example.academicmanagementsystem.controller;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.model.StudentTaskV2;
import org.example.academicmanagementsystem.model.TaskSubmissionV2;
import org.example.academicmanagementsystem.service.StudentTaskV2Service;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v2/tasks")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudentTaskV2Controller {

    private final StudentTaskV2Service taskService;

    @PostMapping
    public ResponseEntity<StudentTaskV2> createTask(@RequestBody StudentTaskV2 task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @GetMapping("/diploma/{id}")
    public ResponseEntity<List<StudentTaskV2>> getTasks(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTasksByDiploma(id));
    }

    @PutMapping("/submissions/{id}/grade")
    public ResponseEntity<TaskSubmissionV2> gradeSubmission(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        BigDecimal grade = new BigDecimal(body.get("grade").toString());
        String feedback = body.get("feedback") != null ? body.get("feedback").toString() : null;
        return ResponseEntity.ok(taskService.gradeSubmission(id, grade, feedback));
    }

    @GetMapping("/{id}/submissions")
    public ResponseEntity<List<TaskSubmissionV2>> getSubmissions(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getSubmissionsByTask(id));
    }
}
