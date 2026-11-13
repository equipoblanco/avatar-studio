package com.plataforma.avatar.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

/**
 * Petición para verificar la compatibilidad entre una lista de activos seleccionados en el Editor (HU-09 / CA-03).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompatibilityCheckRequestDto {

    @NotEmpty(message = "Debe proporcionar al menos un ID de activo para evaluar compatibilidad")
    private List<Long> assetIds;
}
