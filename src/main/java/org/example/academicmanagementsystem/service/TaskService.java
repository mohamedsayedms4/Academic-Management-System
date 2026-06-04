package org.example.academicmanagementsystem.service;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.model.Task;
import org.example.academicmanagementsystem.model.TaskStatus;
import org.example.academicmanagementsystem.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final NotificationService notificationService;

    public List<Task> findAll() {
        return taskRepository.findAll();
    }

    public List<Task> findByAssignedTo(Long userId) {
        return taskRepository.findAll().stream()
                .filter(task -> task.getAssignedTo().getId().equals(userId))
                .toList();
    }

    @Transactional
    public Task save(Task task) {
        boolean isNew = task.getId() == null;
        Task savedTask = taskRepository.save(task);
        if (isNew && savedTask.getAssignedTo() != null) {
            notificationService.createForUser(
                savedTask.getAssignedTo().getId(),
                org.example.academicmanagementsystem.model.NotificationType.TASK_ASSIGNED,
                "A new task has been assigned to you: " + savedTask.getTitle(),
                savedTask.getId()
            );
        }
        return savedTask;
    }

    @Transactional
    public Task updateStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Task not found"));
        task.setStatus(status);
        return taskRepository.save(task);
    }
}
