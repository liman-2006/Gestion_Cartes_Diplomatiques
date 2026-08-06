package com.example.demo.entity;

import com.example.demo.enums.StatutRenouvellement;
import com.example.demo.enums.TypeRenouvellement;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "renouvellements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Renouvellement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expatrie_id", nullable = false)
    private Expatrie expatrie;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeRenouvellement typeRenouvellement;

    @Column(nullable = false)
    private LocalDate dateProgrammee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutRenouvellement statut;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "carte_generee_id")
    private CarteDiplomatique carteGeneree;

    @OneToMany(
            mappedBy = "renouvellement",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<DocumentRenouvellement> documents;
}
