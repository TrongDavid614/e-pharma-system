package com.epharma.service;

import com.epharma.dto.MedicineRequest;
import com.epharma.dto.MedicineResponse;
import com.epharma.entity.Medicine;
import com.epharma.repository.MedicineRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final NotificationService notificationService;

    private static final int EXPIRY_WARN_DAYS = 30;

    public List<MedicineResponse> getAllMedicines() {
        return medicineRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public MedicineResponse getMedicineById(Long id) {
        Medicine medicine = findById(id);
        return toResponse(medicine);
    }

    @Transactional
    public MedicineResponse createMedicine(MedicineRequest request) {
        Medicine medicine = Medicine.builder()
                .name(request.getName())
                .batchId(request.getBatchId())
                .expiryDate(request.getExpiryDate())
                .unit(request.getUnit())
                .quantity(request.getQuantity())
                .price(request.getPrice())
                .lowStockThreshold(request.getLowStockThreshold() != null ? request.getLowStockThreshold() : 10)
                .build();

        Medicine saved = medicineRepository.save(medicine);
        checkAndNotify(saved);
        return toResponse(saved);
    }

    @Transactional
    public MedicineResponse updateMedicine(Long id, MedicineRequest request) {
        Medicine medicine = findById(id);

        medicine.setName(request.getName());
        medicine.setBatchId(request.getBatchId());
        medicine.setExpiryDate(request.getExpiryDate());
        medicine.setUnit(request.getUnit());
        medicine.setQuantity(request.getQuantity());
        medicine.setPrice(request.getPrice());
        if (request.getLowStockThreshold() != null) {
            medicine.setLowStockThreshold(request.getLowStockThreshold());
        }

        Medicine saved = medicineRepository.save(medicine);
        checkAndNotify(saved);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMedicine(Long id) {
        if (!medicineRepository.existsById(id)) {
            throw new EntityNotFoundException("Medicine not found with id: " + id);
        }
        medicineRepository.deleteById(id);
    }

    public void checkAndNotify(Medicine medicine) {
        if (medicine.getQuantity() <= medicine.getLowStockThreshold()) {
            notificationService.sendLowStockAlert(medicine);
        }
        LocalDate expiryWarningDate = LocalDate.now().plusDays(EXPIRY_WARN_DAYS);
        if (!medicine.getExpiryDate().isAfter(expiryWarningDate)) {
            notificationService.sendExpiryAlert(medicine);
        }
    }

    private Medicine findById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Medicine not found with id: " + id));
    }

    private MedicineResponse toResponse(Medicine medicine) {
        return MedicineResponse.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .batchId(medicine.getBatchId())
                .expiryDate(medicine.getExpiryDate())
                .unit(medicine.getUnit())
                .quantity(medicine.getQuantity())
                .price(medicine.getPrice())
                .lowStockThreshold(medicine.getLowStockThreshold())
                .createdAt(medicine.getCreatedAt())
                .updatedAt(medicine.getUpdatedAt())
                .build();
    }
}
