package com.plataforma.avatar.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssetRequestDto {

    @NotNull(message = "El ID de categoría es obligatorio")
    private Long categoryId;

    @NotBlank(message = "El nombre del activo es obligatorio")
    @Size(max = 150, message = "El nombre no puede exceder 150 caracteres")
    private String name;

    @NotNull(message = "El valor Z-Index es obligatorio")
    @Min(value = 0, message = "El Z-Index debe ser mayor o igual a 0")
    private Integer zIndex;

    private List<String> tags;

    @Builder.Default
    private Boolean supportsTint = false;

    @Builder.Default
    private Boolean isDefault = false;

    @Builder.Default
    private Boolean obtainable = true;
}

