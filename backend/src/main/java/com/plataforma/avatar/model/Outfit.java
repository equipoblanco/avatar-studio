package com.plataforma.avatar.model;

import com.plataforma.avatar.dto.OutfitManifestDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entidad de persistencia de outfits con columna nativa tipo JSON en MySQL (CA-06 / HU-02 / HU-10).
 */
@Entity
@Table(name = "outfits", indexes = {
        @Index(name = "idx_outfits_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Outfit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "skin_color", nullable = false, length = 10)
    @Builder.Default
    private String skinColor = "#FFFFFF";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "manifest", columnDefinition = "json", nullable = false)
    private OutfitManifestDto manifest;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
