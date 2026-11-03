package com.plataforma.avatar.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad que modela una regla de incompatibilidad cruzada entre dos activos cosméticos (CA-03 / HU-14).
 * Almacena el par canónico (assetA.id < assetB.id) para garantizar unicidad bidireccional.
 */
@Entity
@Table(
        name = "incompatibility_rules",
        uniqueConstraints = @UniqueConstraint(name = "uk_incompatibility_pair", columnNames = {"asset_a_id", "asset_b_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncompatibilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_a_id", nullable = false)
    private Asset assetA;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "asset_b_id", nullable = false)
    private Asset assetB;

    @Column(length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
