package com.plataforma.avatar.dto;

import com.plataforma.avatar.model.Asset;
import lombok.*;

import java.util.List;

/**
 * DTO optimizado para el catálogo del Editor interactivo 2D (HU-06).
 * Incluye metadatos de accesibilidad (equipable por ser predeterminado o desbloqueado en inventario).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogAssetResponseDto {
    private Long id;
    private Long categoryId;
    private String categoryCode;
    private String categoryName;
    private String name;
    private String spriteUrl;
    private String thumbnailUrl;
    private Integer zIndex;
    private List<String> tags;
    private Boolean isDefault;
    private Boolean supportsTint;
    private Boolean isEquipable;
    private String acquisitionType; // "DEFAULT", "UNLOCKED", "LOCKED"

    public static CatalogAssetResponseDto fromEntity(Asset asset, boolean isEquipable, String acquisitionType) {
        return CatalogAssetResponseDto.builder()
                .id(asset.getId())
                .categoryId(asset.getCategory().getId())
                .categoryCode(asset.getCategory().getCode())
                .categoryName(asset.getCategory().getName())
                .name(asset.getName())
                .spriteUrl(asset.getSpriteUrl())
                .thumbnailUrl(asset.getThumbnailUrl())
                .zIndex(asset.getZIndex())
                .tags(asset.getTags())
                .isDefault(asset.getIsDefault())
                .supportsTint(asset.getSupportsTint())
                .isEquipable(isEquipable)
                .acquisitionType(acquisitionType)
                .build();
    }
}
