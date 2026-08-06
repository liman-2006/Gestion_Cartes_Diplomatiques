package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "documents_renouvellement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentRenouvellement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "renouvellement_id", nullable = false)
    private Renouvellement renouvellement;

    @Column(nullable = false)
    private String nomDocument;

    @Column(nullable = false)
    private boolean recu;
}
