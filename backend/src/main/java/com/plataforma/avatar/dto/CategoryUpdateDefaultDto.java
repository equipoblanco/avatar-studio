package com.plataforma.avatar.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CategoryUpdateDefaultDto {

    @NotNull(message = "El defaultAssetId es obligatorio para configurar la pieza de fallback")
    private Long defaultAssetId;
}

