package com.epharma.repository;

import com.epharma.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    List<Medicine> findByQuantityLessThanEqual(int threshold);

    List<Medicine> findByExpiryDateBefore(LocalDate date);
}
