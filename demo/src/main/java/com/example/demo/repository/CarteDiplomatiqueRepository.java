package com.example.demo.repository;

import com.example.demo.entity.CarteDiplomatique;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CarteDiplomatiqueRepository extends JpaRepository<CarteDiplomatique, Long> {

    Optional<CarteDiplomatique> findByNumeroCarte(String numeroCarte);

    boolean existsByNumeroCarte(String numeroCarte);

    List<CarteDiplomatique> findByExpatrieId(Long expatrieId);

    List<CarteDiplomatique> findByMembreFamilleId(Long membreFamilleId);
}