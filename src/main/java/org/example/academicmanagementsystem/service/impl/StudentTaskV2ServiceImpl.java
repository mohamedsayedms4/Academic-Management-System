package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.model.RoundDiplomaV2;
import org.example.academicmanagementsystem.model.StudentTaskV2;
import org.example.academicmanagementsystem.model.SubmissionStatus;
import org.example.academicmanagementsystem.model.TaskSubmissionV2;
import org.example.academicmanagementsystem.repository.RoundDiplomaV2Repository;
import org.example.academicmanagementsystem.repository.StudentTaskV2Repository;
import org.example.academicmanagementsystem.repository.TaskSubmissionV2Repository;
import org.example.academicmanagementsystem.service.StudentTaskV2Service;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentTaskV2ServiceImpl implements StudentTaskV2Service {

    private final StudentTaskV2Repository taskRepository;
    private final TaskSubmissionV2Repository submissionRepository;
    private final RoundDiplomaV2Repository roundDiplomaRepository;

    @Override
    @Transactional
    public StudentTaskV2 createTask(StudentTaskV2 task) {
        return taskRepository.save(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentTaskV2> getTasksByDiploma(Long roundDiplomaId) {
        RoundDiplomaV2 rd = roundDiplomaRepository.findById(roundDiplomaId)
                .orElseThrow(() -> new RuntimeException("RoundDiploma not found"));
        return taskRepository.findByRoundDiploma(rd);
    }

    @Override
    @Transactional
    public TaskSubmissionV2 gradeSubmission(Long submissionId, BigDecimal grade, String feedback) {
        TaskSubmissionV2 submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
        submission.setGrade(grade);
        submission.setInstructorFeedback(feedback);
        submission.setStatus(SubmissionStatus.GRADED);
        return submissionRepository.save(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskSubmissionV2> getSubmissionsByTask(Long taskId) {
        StudentTaskV2 task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        return submissionRepository.findByTask(task);
    }
}
