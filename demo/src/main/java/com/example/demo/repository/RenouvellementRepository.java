package com.example.demo.repository;

import com.example.demo.entity.Renouvellement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RenouvellementRepository extends JpaRepository<Renouvellement, Long> {
    List<Renouvellement> findByExpatrieId(Long expatrieId);
    List<Renouvellement> findByCarteGenereeId(Long carteGenereeId);
}
