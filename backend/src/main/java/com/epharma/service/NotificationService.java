package com.epharma.service;

import com.epharma.dto.NotificationMessage;
import com.epharma.entity.Medicine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendLowStockAlert(Medicine medicine) {
        NotificationMessage notification = NotificationMessage.builder()
                .type(NotificationMessage.NotificationType.LOW_STOCK)
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .message(String.format(
                        "Low stock alert: '%s' (Batch: %s) has only %d units remaining (threshold: %d).",
                        medicine.getName(),
                        medicine.getBatchId(),
                        medicine.getQuantity(),
                        medicine.getLowStockThreshold()
                ))
                .build();

        log.info("Sending low stock notification for medicine: {}", medicine.getName());
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    public void sendExpiryAlert(Medicine medicine) {
        NotificationMessage notification = NotificationMessage.builder()
                .type(NotificationMessage.NotificationType.EXPIRING_SOON)
                .medicineId(medicine.getId())
                .medicineName(medicine.getName())
                .message(String.format(
                        "Expiry alert: '%s' (Batch: %s) expires on %s.",
                        medicine.getName(),
                        medicine.getBatchId(),
                        medicine.getExpiryDate()
                ))
                .build();

        log.info("Sending expiry notification for medicine: {}", medicine.getName());
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }
}
