package com.plataforma.avatar.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO para la creación de una regla de incompatibilidad desde el Backoffice (CA-HU14.1).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncompatibilityRuleRequestDto {

    @NotNull(message = "El ID del primer activo (assetAId) es obligatorio")
    private Long assetAId;

    @NotNull(message = "El ID del segundo activo (assetBId) es obligatorio")
    private Long assetBId;

    @Size(max = 255, message = "El motivo de incompatibilidad no puede exceder 255 caracteres")
    private String reason;
}
