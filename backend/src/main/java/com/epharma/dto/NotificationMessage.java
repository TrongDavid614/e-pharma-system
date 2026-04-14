package com.epharma.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {

    public enum NotificationType {
        LOW_STOCK, EXPIRING_SOON
    }

    private NotificationType type;
    private Long medicineId;
    private String medicineName;
    private String message;
}
