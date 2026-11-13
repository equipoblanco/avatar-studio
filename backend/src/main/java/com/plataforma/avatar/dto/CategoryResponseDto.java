package com.plataforma.avatar.dto;

import com.plataforma.avatar.model.Category;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryResponseDto {
    private Long id;
    private String code;
    private String name;
    private Integer zIndexDefault;
    private Long defaultAssetId;
    private String defaultAssetName;
    private String defaultAssetSpriteUrl;
    private Boolean isRequired;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CategoryResponseDto fromEntity(Category category) {
        return CategoryResponseDto.builder()
                .id(category.getId())
                .code(category.getCode())
                .name(category.getName())
                .zIndexDefault(category.getZIndexDefault())
                .defaultAssetId(category.getDefaultAsset() != null ? category.getDefaultAsset().getId() : null)
                .defaultAssetName(category.getDefaultAsset() != null ? category.getDefaultAsset().getName() : null)
                .defaultAssetSpriteUrl(category.getDefaultAsset() != null ? category.getDefaultAsset().getSpriteUrl() : null)
                .isRequired(category.getIsRequired())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}

