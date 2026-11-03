package com.plataforma.avatar.dto;

import com.plataforma.avatar.model.IncompatibilityRule;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para la respuesta y consulta de reglas de incompatibilidad (CA-HU14.2).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncompatibilityRuleResponseDto {
    private Long id;
    
    // Datos del Activo A
    private Long assetAId;
    private String assetAName;
    private Long assetACategoryId;
    private String assetACategoryName;
    private String assetASpriteUrl;

    // Datos del Activo B
    private Long assetBId;
    private String assetBName;
    private Long assetBCategoryId;
    private String assetBCategoryName;
    private String assetBSpriteUrl;

    private String reason;
    private LocalDateTime createdAt;

    public static IncompatibilityRuleResponseDto fromEntity(IncompatibilityRule rule) {
        return IncompatibilityRuleResponseDto.builder()
                .id(rule.getId())
                .assetAId(rule.getAssetA().getId())
                .assetAName(rule.getAssetA().getName())
                .assetACategoryId(rule.getAssetA().getCategory().getId())
                .assetACategoryName(rule.getAssetA().getCategory().getName())
                .assetASpriteUrl(rule.getAssetA().getSpriteUrl())
                .assetBId(rule.getAssetB().getId())
                .assetBName(rule.getAssetB().getName())
                .assetBCategoryId(rule.getAssetB().getCategory().getId())
                .assetBCategoryName(rule.getAssetB().getCategory().getName())
                .assetBSpriteUrl(rule.getAssetB().getSpriteUrl())
                .reason(rule.getReason())
                .createdAt(rule.getCreatedAt())
                .build();
    }
}
