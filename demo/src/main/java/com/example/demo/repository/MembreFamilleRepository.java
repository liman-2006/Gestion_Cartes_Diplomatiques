package com.example.demo.repository;

import com.example.demo.entity.MembreFamille;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MembreFamilleRepository extends JpaRepository<MembreFamille, Long> {

    List<MembreFamille> findByExpatrieId(Long expatrieId);
}