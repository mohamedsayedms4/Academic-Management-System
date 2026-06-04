package org.example.academicmanagementsystem.service;

import org.example.academicmanagementsystem.dto.NotificationResponse;
import org.example.academicmanagementsystem.model.NotificationType;
import org.example.academicmanagementsystem.model.UserRole;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications();
    long getUnreadCount();
    void markAsRead(Long id);
    void markAllAsRead();
    void deleteNotification(Long id);
    void createForUser(Long userId, NotificationType type, String message, Long referenceId);
    void createForRole(UserRole role, NotificationType type, String message, Long referenceId);
}
