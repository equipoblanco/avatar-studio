package com.plataforma.avatar.dto;

import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetResponseDto {
    private Long id;
    private Long categoryId;
    private String categoryCode;
    private String categoryName;
    private String name;
    private String spriteUrl;
    private String thumbnailUrl;
    private Integer zIndex;
    private List<String> tags;
    private AssetStatus status;
    private Boolean isDefault;
    private Boolean supportsTint;
    private Boolean obtainable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AssetResponseDto fromEntity(Asset asset) {
        return AssetResponseDto.builder()
                .id(asset.getId())
                .categoryId(asset.getCategory().getId())
                .categoryCode(asset.getCategory().getCode())
                .categoryName(asset.getCategory().getName())
                .name(asset.getName())
                .spriteUrl(asset.getSpriteUrl())
                .thumbnailUrl(asset.getThumbnailUrl())
                .zIndex(asset.getZIndex())
                .tags(asset.getTags())
                .status(asset.getStatus())
                .isDefault(asset.getIsDefault())
                .supportsTint(asset.getSupportsTint())
                .obtainable(asset.getObtainable())
                .createdAt(asset.getCreatedAt())
                .updatedAt(asset.getUpdatedAt())
                .build();
    }
}

