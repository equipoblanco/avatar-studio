package com.plataforma.avatar.dto;

import lombok.*;

import java.util.List;

/**
 * Resultado de la validación de compatibilidad (HU-09 / CA-03).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompatibilityCheckResponseDto {
    private boolean compatible;
    private List<ConflictDetail> conflicts;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConflictDetail {
        private Long ruleId;
        private Long assetAId;
        private String assetAName;
        private Long assetBId;
        private String assetBName;
        private String message;
    }
}
