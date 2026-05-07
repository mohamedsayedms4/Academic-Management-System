package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.model.StudentTaskV2;
import org.example.academicmanagementsystem.model.TaskSubmissionV2;

import java.util.List;

public interface StudentTaskV2Service {
    StudentTaskV2 createTask(StudentTaskV2 task);
    List<StudentTaskV2> getTasksByDiploma(Long roundDiplomaId);
    TaskSubmissionV2 gradeSubmission(Long submissionId, java.math.BigDecimal grade, String feedback);
    List<TaskSubmissionV2> getSubmissionsByTask(Long taskId);
}
