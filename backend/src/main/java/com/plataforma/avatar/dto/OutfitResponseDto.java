package com.plataforma.avatar.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitResponseDto {
    private Long id;
    private Long userId;
    private String name;
    private String skinColor;
    private OutfitManifestDto manifest;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
