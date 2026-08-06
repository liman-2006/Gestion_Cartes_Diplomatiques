package com.example.demo.repository;

import com.example.demo.entity.DocumentRenouvellement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentRenouvellementRepository extends JpaRepository<DocumentRenouvellement, Long> {
    List<DocumentRenouvellement> findByRenouvellementId(Long renouvellementId);
}
