package com.epharma.dto;

import com.epharma.entity.Medicine;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineRequest {

    @NotBlank(message = "Medicine name is required")
    private String name;

    @NotBlank(message = "Batch ID is required")
    private String batchId;

    @NotNull(message = "Expiry date is required")
    @FutureOrPresent(message = "Expiry date must be today or in the future")
    private LocalDate expiryDate;

    @NotNull(message = "Unit is required")
    private Medicine.Unit unit;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    @Min(value = 1, message = "Low stock threshold must be at least 1")
    private Integer lowStockThreshold = 10;
}
