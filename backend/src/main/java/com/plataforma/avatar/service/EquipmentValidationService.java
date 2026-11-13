package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.EquipmentValidationResultDto;
import com.plataforma.avatar.dto.OutfitManifestDto;
import com.plataforma.avatar.dto.OutfitSlotDto;
import com.plataforma.avatar.exception.UnprocessableEntityException;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.model.IncompatibilityRule;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import com.plataforma.avatar.repository.IncompatibilityRuleRepository;
import com.plataforma.avatar.repository.UserInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class EquipmentValidationService {

    public static final Set<String> OFFICIAL_SLOTS = Set.of(
            "cuerpo_base", "calzado", "ropa_inferior", "rostro", "ropa_superior", "accesorios", "peinado"
    );

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final UserInventoryRepository userInventoryRepository;
    private final IncompatibilityRuleRepository incompatibilityRuleRepository;

    public EquipmentValidationService(
            AssetRepository assetRepository,
            CategoryRepository categoryRepository,
            UserInventoryRepository userInventoryRepository,
            IncompatibilityRuleRepository incompatibilityRuleRepository
    ) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.userInventoryRepository = userInventoryRepository;
        this.incompatibilityRuleRepository = incompatibilityRuleRepository;
    }

    /**
     * CA-HU09.3 / CA-02 / CA-03 / CA-06:
     * Validación defensiva de integridad en backend.
     * Si el manifiesto JSON es inválido, rechaza la transacción lanzando
     * IllegalArgumentException (400) o UnprocessableEntityException (422).
     */
    public void validateOutfitManifestOrThrow(Long userId, OutfitManifestDto manifest) {
        if (manifest == null || manifest.getSlots() == null) {
            throw new IllegalArgumentException("El manifiesto de outfit no puede ser nulo y debe incluir el mapa de ranuras (slots)");
        }

        Map<String, OutfitSlotDto> slots = manifest.getSlots();

        // 1. Validación de Unicidad de Ranura y Códigos Oficiales (CA-02 / CA-HU09.1)
        for (String slotCode : slots.keySet()) {
            if (!OFFICIAL_SLOTS.contains(slotCode)) {
                throw new IllegalArgumentException(
                        "Ranura inválida detectada en el manifiesto: '" + slotCode +
                        "'. Las 7 ranuras admitidas son: " + OFFICIAL_SLOTS
                );
            }
        }

        // 2. Validación de Ranura Obligatoria (cuerpo_base)
        OutfitSlotDto baseSlot = slots.get("cuerpo_base");
        if (baseSlot == null || baseSlot.getAssetId() == null) {
            throw new UnprocessableEntityException(
                    "Integridad del Avatar violada: La ranura 'cuerpo_base' es obligatoria para la silueta del personaje."
            );
        }

        // 3. Extracción de activos equipados y verificación de no duplicidad de slot
        List<Long> equippedAssetIds = new ArrayList<>();
        Map<String, Long> categoryAssignments = new HashMap<>();

        for (Map.Entry<String, OutfitSlotDto> entry : slots.entrySet()) {
            String slotCode = entry.getKey();
            OutfitSlotDto slotDto = entry.getValue();

            if (slotDto == null || slotDto.getAssetId() == null) {
                continue; // Ranura vacía permitida si no es obligatoria
            }

            Long assetId = slotDto.getAssetId();

            Asset asset = assetRepository.findById(assetId)
                    .orElseThrow(() -> new UnprocessableEntityException("Activo cosmético no encontrado con ID: " + assetId));

            // Verificar que el activo realmente pertenece a la categoría declarada en la ranura
            if (!asset.getCategory().getCode().equals(slotCode)) {
                throw new UnprocessableEntityException(
                        String.format("Incoherencia de ranura [CA-02]: El activo '%s' (ID: %d) pertenece a la categoría '%s' " +
                                      "y no puede ser asignado al slot '%s'.",
                                asset.getName(), assetId, asset.getCategory().getName(), slotCode)
                );
            }

            // CA-HU09.1: Prevención estricta de duplicidad en la misma ranura
            if (categoryAssignments.containsKey(slotCode)) {
                throw new UnprocessableEntityException(
                        "Duplicidad de slot [CA-02]: Se detectaron múltiples activos asignados a la misma ranura '" + slotCode + "'."
                );
            }
            categoryAssignments.put(slotCode, assetId);

            // 4. Validación de Estado Activo (CA-07 / HU-13)
            if (asset.getStatus() != AssetStatus.ACTIVE) {
                throw new UnprocessableEntityException(
                        String.format("Activo Inactivo [CA-07]: El cosmético '%s' (ID: %d) está dado de baja del catálogo y no puede equiparse.",
                                asset.getName(), assetId)
                );
            }

            // 5. Validación de Inventario / Pertenencia (CA-HU09.3 / CA-08)
            boolean isDefault = Boolean.TRUE.equals(asset.getIsDefault());
            boolean isOwned = userInventoryRepository.existsByUserIdAndAssetId(userId, assetId);

            if (!isDefault && !isOwned) {
                throw new UnprocessableEntityException(
                        String.format("Violación de inventario [CA-HU09.3]: El usuario ID %d no posee el activo '%s' (ID: %d) en su guardarropa.",
                                userId, asset.getName(), assetId)
                );
            }

            equippedAssetIds.add(assetId);
        }

        // 6. Validación de Incompatibilidad Cruzada (CA-03 / CA-HU09.2)
        if (equippedAssetIds.size() >= 2) {
            List<IncompatibilityRule> violatedRules = incompatibilityRuleRepository.findIncompatibilitiesAmongAssets(equippedAssetIds);

            if (!violatedRules.isEmpty()) {
                IncompatibilityRule firstConflict = violatedRules.get(0);
                throw new UnprocessableEntityException(
                        String.format("Bloqueo por incompatibilidad cruzada [CA-03]: El activo '%s' (ID: %d) colisiona con '%s' (ID: %d). Motivo: %s",
                                firstConflict.getAssetA().getName(), firstConflict.getAssetA().getId(),
                                firstConflict.getAssetB().getName(), firstConflict.getAssetB().getId(),
                                firstConflict.getReason())
                );
            }
        }
    }

    /**
     * Validador no bloqueante para pre-verificación en vivo en el Editor
     */
    public EquipmentValidationResultDto validateEquipment(Long userId, OutfitManifestDto manifest) {
        EquipmentValidationResultDto result = new EquipmentValidationResultDto();
        try {
            validateOutfitManifestOrThrow(userId, manifest);
            result.setValid(true);
        } catch (Exception ex) {
            result.setValid(false);
            result.getErrors().add(ex.getMessage());
        }
        return result;
    }
}
