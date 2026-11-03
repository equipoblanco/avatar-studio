package com.plataforma.avatar.dto;

import com.plataforma.avatar.model.AssetStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssetStatusUpdateDto {

    @NotNull(message = "El nuevo estado es obligatorio (ACTIVE o INACTIVE)")
    private AssetStatus status;
}

