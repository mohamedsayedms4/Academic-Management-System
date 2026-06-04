package org.example.academicmanagementsystem.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.academicmanagementsystem.dto.NotificationResponse;
import org.example.academicmanagementsystem.model.Notification;
import org.example.academicmanagementsystem.model.NotificationType;
import org.example.academicmanagementsystem.model.User;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.repository.NotificationRepository;
import org.example.academicmanagementsystem.repository.UserRepository;
import org.example.academicmanagementsystem.security.UserDetailsImpl;
import org.example.academicmanagementsystem.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User is not authenticated");
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getId();
            return userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
        }
        throw new RuntimeException("Principal is not of type UserDetailsImpl");
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications() {
        User currentUser = getCurrentUser();
        // Return notifications targeted to this user or to their specific role
        return notificationRepository.findByUserOrTargetRoleOrderByCreatedAtDesc(currentUser, currentUser.getRole())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByUserOrTargetRoleAndIsReadFalse(currentUser, currentUser.getRole());
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        // Check if the notification belongs to this user or their role
        if ((notification.getUser() != null && notification.getUser().getId().equals(currentUser.getId())) ||
                (notification.getTargetRole() != null && notification.getTargetRole() == currentUser.getRole())) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        } else {
            throw new RuntimeException("Unauthorized to mark this notification as read");
        }
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Notification> notifications = notificationRepository.findByUserOrTargetRoleOrderByCreatedAtDesc(currentUser, currentUser.getRole());
        for (Notification notification : notifications) {
            if (!notification.getIsRead()) {
                notification.setIsRead(true);
            }
        }
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        User currentUser = getCurrentUser();
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));

        if ((notification.getUser() != null && notification.getUser().getId().equals(currentUser.getId())) ||
                (notification.getTargetRole() != null && notification.getTargetRole() == currentUser.getRole())) {
            notificationRepository.delete(notification);
        } else {
            throw new RuntimeException("Unauthorized to delete this notification");
        }
    }

    @Override
    @Transactional
    public void createForUser(Long userId, NotificationType type, String message, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Target user not found with id: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);
        // CreatedBy audit will be populated or set manually
        notification.setCreatedBy("SYSTEM");
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void createForRole(UserRole role, NotificationType type, String message, Long referenceId) {
        Notification notification = new Notification();
        notification.setTargetRole(role);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setIsRead(false);
        notification.setCreatedBy("SYSTEM");
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .type(n.getType())
                .message(n.getMessage())
                .isRead(n.getIsRead())
                .referenceId(n.getReferenceId())
                .createdAt(n.getCreatedAt())
                .createdBy(n.getCreatedBy())
                .build();
    }
}
