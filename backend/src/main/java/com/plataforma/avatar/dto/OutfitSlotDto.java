package com.plataforma.avatar.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitSlotDto {

    @NotNull(message = "El ID del activo asignado al slot es obligatorio")
    private Long assetId;

    private Integer zIndex;
}
