package org.example.academicmanagementsystem.repository;

import org.example.academicmanagementsystem.model.Notification;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrTargetRoleOrderByCreatedAtDesc(User user, UserRole targetRole);

    long countByUserOrTargetRoleAndIsReadFalse(User user, UserRole targetRole);
}
