package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.StudentTaskV2;
import org.example.academicmanagementsystem.model.TaskSubmissionV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskSubmissionV2Repository extends JpaRepository<TaskSubmissionV2, Long> {
    List<TaskSubmissionV2> findByTask(StudentTaskV2 task);
}
