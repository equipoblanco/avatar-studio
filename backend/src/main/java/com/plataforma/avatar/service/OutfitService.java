package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.EquipmentValidationResultDto;
import com.plataforma.avatar.dto.OutfitManifestDto;
import com.plataforma.avatar.dto.OutfitResponseDto;
import com.plataforma.avatar.model.Outfit;
import com.plataforma.avatar.repository.OutfitRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class OutfitService {

    private final OutfitRepository outfitRepository;
    private final EquipmentValidationService validationService;

    public OutfitService(OutfitRepository outfitRepository, EquipmentValidationService validationService) {
        this.outfitRepository = outfitRepository;
        this.validationService = validationService;
    }

    /**
     * CA-HU09.3 / CA-06 / HU-02:
     * Persistencia de outfit con validación defensiva estricta de unicidad de ranura,
     * inventario y compatibilidad de piezas.
     */
    public OutfitResponseDto saveOutfit(Long userId, OutfitManifestDto manifest) {
        // Validación defensiva en backend
        validationService.validateOutfitManifestOrThrow(userId, manifest);

        Outfit outfit = Outfit.builder()
                .userId(userId)
                .name(manifest.getName())
                .skinColor(manifest.getSkinColor() != null ? manifest.getSkinColor() : "#FFFFFF")
                .manifest(manifest)
                .build();

        Outfit savedOutfit = outfitRepository.save(outfit);

        return OutfitResponseDto.builder()
                .id(savedOutfit.getId())
                .userId(savedOutfit.getUserId())
                .name(savedOutfit.getName())
                .skinColor(savedOutfit.getSkinColor())
                .manifest(savedOutfit.getManifest())
                .createdAt(savedOutfit.getCreatedAt())
                .updatedAt(savedOutfit.getUpdatedAt())
                .build();
    }

    /**
     * Pre-validación no bloqueante para el cliente React
     */
    @Transactional(readOnly = true)
    public EquipmentValidationResultDto preValidateOutfit(Long userId, OutfitManifestDto manifest) {
        return validationService.validateEquipment(userId, manifest);
    }

    /**
     * Consulta de guardarropa de outfits del usuario
     */
    @Transactional(readOnly = true)
    public List<OutfitResponseDto> getUserOutfits(Long userId) {
        return outfitRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(o -> OutfitResponseDto.builder()
                        .id(o.getId())
                        .userId(o.getUserId())
                        .name(o.getName())
                        .skinColor(o.getSkinColor())
                        .manifest(o.getManifest())
                        .createdAt(o.getCreatedAt())
                        .updatedAt(o.getUpdatedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public OutfitResponseDto getOutfitById(Long outfitId, Long userId) {
        Outfit outfit = outfitRepository.findByIdAndUserId(outfitId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Outfit no encontrado con ID: " + outfitId));

        return OutfitResponseDto.builder()
                .id(outfit.getId())
                .userId(outfit.getUserId())
                .name(outfit.getName())
                .skinColor(outfit.getSkinColor())
                .manifest(outfit.getManifest())
                .createdAt(outfit.getCreatedAt())
                .updatedAt(outfit.getUpdatedAt())
                .build();
    }
}
