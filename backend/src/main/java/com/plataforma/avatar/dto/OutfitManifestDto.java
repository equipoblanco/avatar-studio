package com.plataforma.avatar.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.Map;

/**
 * Manifiesto estructurado JSON de un outfit persistido en MySQL (CA-06 / CA-HU09.3 / HU-10).
 * Mapea las 7 categorías maestras con su respectivo slot de pieza única.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitManifestDto {

    @NotBlank(message = "El nombre del outfit es obligatorio")
    private String name;

    @Builder.Default
    private String skinColor = "#FFFFFF";

    /**
     * Mapa de ranuras donde la clave es el código de categoría (ej: "peinado", "ropa_superior")
     * y el valor es el activo asignado a ese slot.
     * Garantiza la unicidad por ranura (CA-02).
     */
    @NotNull(message = "El mapa de ranuras (slots) es obligatorio")
    private Map<String, OutfitSlotDto> slots;
}
