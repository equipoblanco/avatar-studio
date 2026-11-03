package com.plataforma.avatar.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Resultado de la validación defensiva de equipamiento y compatibilidad (CA-HU09.3).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EquipmentValidationResultDto {
    private boolean valid;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
}
