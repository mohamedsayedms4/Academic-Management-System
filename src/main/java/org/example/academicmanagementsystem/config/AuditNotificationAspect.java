package org.example.academicmanagementsystem.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.example.academicmanagementsystem.model.NotificationType;
import org.example.academicmanagementsystem.model.UserRole;
import org.example.academicmanagementsystem.service.NotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditNotificationAspect {

    private final NotificationService notificationService;

    private static final Set<String> SKIPPED_SIGNATURES = new HashSet<>();

    static {
        // Skip methods that already have custom business notifications
        SKIPPED_SIGNATURES.add("LeadServiceImpl.save");
        SKIPPED_SIGNATURES.add("LeadServiceImpl.createLeadByTelesales");
        SKIPPED_SIGNATURES.add("LeadServiceImpl.update");
        SKIPPED_SIGNATURES.add("StudentV2ServiceImpl.enrollStudent");
        SKIPPED_SIGNATURES.add("StudentV2ServiceImpl.cancelEnrollment");
        SKIPPED_SIGNATURES.add("PaymentServiceImpl.recordPayment");
        SKIPPED_SIGNATURES.add("RoundV2ServiceImpl.createRound");
        SKIPPED_SIGNATURES.add("TaskService.save");
    }

    @AfterReturning(
        pointcut = "execution(* org.example.academicmanagementsystem.service..*(..)) && " +
                   "(execution(* *.save*(..)) || execution(* *.create*(..)) || execution(* *.update*(..)) || " +
                   "execution(* *.delete*(..)) || execution(* *.enroll*(..)) || execution(* *.cancel*(..)) || " +
                   "execution(* *.add*(..)) || execution(* *.remove*(..)) || execution(* *.record*(..)) || " +
                   "execution(* *.resolve*(..)) || execution(* *.restore*(..)) || execution(* *.postpone*(..)) || " +
                   "execution(* *.run*(..)) || execution(* *.process*(..)))",
        returning = "result"
    )
    public void afterServiceChange(JoinPoint joinPoint, Object result) {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getSignature().getDeclaringType().getSimpleName();
        String fullSignature = className + "." + methodName;

        if (SKIPPED_SIGNATURES.contains(fullSignature)) {
            return;
        }

        // Skip NotificationService itself to avoid infinite loop
        if (className.contains("NotificationService")) {
            return;
        }

        String username = getUsername();
        String action = getActionFromMethod(methodName);
        String entityName = getEntityNameFromClassOrMethod(className, methodName);
        String message = String.format("User %s performed %s on %s", username, action.toLowerCase(), entityName);

        NotificationType type = getNotificationType(action);

        try {
            // Notify Admin
            notificationService.createForRole(UserRole.ADMIN, type, message, null);

            // Notify specific roles based on entity
            if (isFinanceRelated(entityName)) {
                notificationService.createForRole(UserRole.ACCOUNTANT, type, message, null);
            } else if (isLeadOrStudentRelated(entityName)) {
                notificationService.createForRole(UserRole.MODERATOR, type, message, null);
            }
        } catch (Exception e) {
            log.error("Failed to create audit notification for " + fullSignature, e);
        }
    }

    private String getUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "SYSTEM";
    }

    private String getActionFromMethod(String methodName) {
        String lower = methodName.toLowerCase();
        if (lower.startsWith("create") || lower.startsWith("enroll") || lower.startsWith("add") || lower.startsWith("record")) {
            return "CREATE";
        }
        if (lower.startsWith("update") || lower.startsWith("resolve") || lower.startsWith("restore") || lower.startsWith("postpone") || lower.startsWith("process")) {
            return "UPDATE";
        }
        if (lower.startsWith("delete") || lower.startsWith("cancel") || lower.startsWith("remove")) {
            return "DELETE";
        }
        return "WRITE";
    }

    private String getEntityNameFromClassOrMethod(String className, String methodName) {
        String name = className.replace("ServiceImpl", "").replace("Service", "");
        if (name.isEmpty() || name.equals("Object")) {
            name = methodName;
        }
        return name;
    }

    private NotificationType getNotificationType(String action) {
        switch (action) {
            case "CREATE":
                return NotificationType.SYSTEM_CREATE;
            case "UPDATE":
                return NotificationType.SYSTEM_UPDATE;
            case "DELETE":
                return NotificationType.SYSTEM_DELETE;
            default:
                return NotificationType.SYSTEM_UPDATE;
        }
    }

    private boolean isFinanceRelated(String entityName) {
        String lower = entityName.toLowerCase();
        return lower.contains("payment") || lower.contains("finance") || lower.contains("salary") || lower.contains("expense") || lower.contains("invoice") || lower.contains("payroll");
    }

    private boolean isLeadOrStudentRelated(String entityName) {
        String lower = entityName.toLowerCase();
        return lower.contains("lead") || lower.contains("student") || lower.contains("round") || lower.contains("diploma") || lower.contains("complaint") || lower.contains("instructor");
    }
}
