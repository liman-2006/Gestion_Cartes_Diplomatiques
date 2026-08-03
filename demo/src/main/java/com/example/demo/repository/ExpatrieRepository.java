package com.example.demo.repository;

import com.example.demo.entity.Expatrie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ExpatrieRepository extends JpaRepository<Expatrie, Long> {

    Optional<Expatrie> findByMatricule(String matricule);

    boolean existsByMatricule(String matricule);
}