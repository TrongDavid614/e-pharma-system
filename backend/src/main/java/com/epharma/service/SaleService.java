package com.epharma.service;

import com.epharma.dto.SaleItemRequest;
import com.epharma.dto.SaleRequest;
import com.epharma.dto.SaleResponse;
import com.epharma.entity.Medicine;
import com.epharma.entity.Sale;
import com.epharma.entity.SaleItem;
import com.epharma.entity.User;
import com.epharma.repository.MedicineRepository;
import com.epharma.repository.SaleRepository;
import com.epharma.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public SaleResponse createSale(SaleRequest request, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Sale sale = Sale.builder()
                .createdBy(user)
                .totalAmount(BigDecimal.ZERO)
                .items(new ArrayList<>())
                .build();

        BigDecimal total = BigDecimal.ZERO;

        for (SaleItemRequest itemRequest : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemRequest.getMedicineId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Medicine not found with id: " + itemRequest.getMedicineId()));

            if (medicine.getQuantity() < itemRequest.getQuantity()) {
                throw new IllegalStateException(String.format(
                        "Insufficient stock for '%s'. Available: %d, Requested: %d",
                        medicine.getName(), medicine.getQuantity(), itemRequest.getQuantity()
                ));
            }

            medicine.setQuantity(medicine.getQuantity() - itemRequest.getQuantity());
            medicineRepository.save(medicine);

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(medicine.getPrice())
                    .build();

            sale.getItems().add(saleItem);
            total = total.add(medicine.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity())));

            if (medicine.getQuantity() <= medicine.getLowStockThreshold()) {
                notificationService.sendLowStockAlert(medicine);
            }
        }

        sale.setTotalAmount(total);
        Sale saved = saleRepository.save(sale);
        return toResponse(saved);
    }

    public List<SaleResponse> getAllSales() {
        return saleRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private SaleResponse toResponse(Sale sale) {
        List<SaleResponse.SaleItemResponse> itemResponses = sale.getItems().stream()
                .map(item -> SaleResponse.SaleItemResponse.builder()
                        .id(item.getId())
                        .medicineId(item.getMedicine().getId())
                        .medicineName(item.getMedicine().getName())
                        .quantity(item.getQuantity())
                        .unitPrice(item.getUnitPrice())
                        .build())
                .collect(Collectors.toList());

        return SaleResponse.builder()
                .id(sale.getId())
                .saleDate(sale.getSaleDate())
                .totalAmount(sale.getTotalAmount())
                .items(itemResponses)
                .build();
    }
}
