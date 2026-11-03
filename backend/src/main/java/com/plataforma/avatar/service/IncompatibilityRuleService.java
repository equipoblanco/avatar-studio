package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.*;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.IncompatibilityRule;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.IncompatibilityRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@Transactional
public class IncompatibilityRuleService {

    private final IncompatibilityRuleRepository ruleRepository;
    private final AssetRepository assetRepository;

    public IncompatibilityRuleService(
            IncompatibilityRuleRepository ruleRepository,
            AssetRepository assetRepository
    ) {
        this.ruleRepository = ruleRepository;
        this.assetRepository = assetRepository;
    }

    /**
     * CA-HU14.1 / CA-03: Creación de regla de incompatibilidad con normalización de par único
     */
    public IncompatibilityRuleResponseDto createRule(IncompatibilityRuleRequestDto dto) {
        if (dto.getAssetAId().equals(dto.getAssetBId())) {
            throw new IllegalArgumentException(
                    "Regla inválida: Un activo no puede declararse incompatible consigo mismo (ID: " + dto.getAssetAId() + ")"
            );
        }

        // Normalización canónica del par: menor ID siempre como assetA
        long lowerId = Math.min(dto.getAssetAId(), dto.getAssetBId());
        long higherId = Math.max(dto.getAssetAId(), dto.getAssetBId());

        Asset assetA = assetRepository.findById(lowerId)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + lowerId));

        Asset assetB = assetRepository.findById(higherId)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + higherId));

        // Validación de par duplicado en MySQL
        if (ruleRepository.existsByAssetAIdAndAssetBId(lowerId, higherId)) {
            throw new IllegalStateException(
                    "Conflicto de Regla: Ya existe una regla de incompatibilidad activa entre '" +
                    assetA.getName() + "' (ID: " + lowerId + ") y '" +
                    assetB.getName() + "' (ID: " + higherId + ")."
            );
        }

        String reason = dto.getReason();
        if (reason == null || reason.trim().isEmpty()) {
            reason = "Incompatibilidad visual entre " + assetA.getCategory().getName() + " y " + assetB.getCategory().getName();
        }

        IncompatibilityRule rule = IncompatibilityRule.builder()
                .assetA(assetA)
                .assetB(assetB)
                .reason(reason.trim())
                .build();

        IncompatibilityRule savedRule = ruleRepository.save(rule);
        return IncompatibilityRuleResponseDto.fromEntity(savedRule);
    }

    /**
     * CA-HU14.2: Consulta paginada de reglas activas para el Backoffice
     */
    @Transactional(readOnly = true)
    public Page<IncompatibilityRuleResponseDto> getRules(Pageable pageable) {
        return ruleRepository.findAllWithDetails(pageable)
                .map(IncompatibilityRuleResponseDto::fromEntity);
    }

    /**
     * CA-HU14.2: Listado completo de reglas
     */
    @Transactional(readOnly = true)
    public List<IncompatibilityRuleResponseDto> getAllRules() {
        return ruleRepository.findAllWithDetails().stream()
                .map(IncompatibilityRuleResponseDto::fromEntity)
                .toList();
    }

    /**
     * CA-HU14.2 / CA-03: Eliminación de regla de incompatibilidad desde el Backoffice
     * Restaura de inmediato la compatibilidad de ambos activos en el Editor (HU-09).
     */
    public void deleteRule(Long id) {
        if (!ruleRepository.existsById(id)) {
            throw new EntityNotFoundException("Regla de incompatibilidad no encontrada con ID: " + id);
        }
        ruleRepository.deleteById(id);
    }

    /**
     * HU-09 / CA-03: Motor de Validación de Compatibilidad en tiempo real para el Editor y Outfits
     */
    @Transactional(readOnly = true)
    public CompatibilityCheckResponseDto validateCompatibility(List<Long> assetIds) {
        if (assetIds == null || assetIds.size() < 2) {
            return CompatibilityCheckResponseDto.builder()
                    .compatible(true)
                    .conflicts(Collections.emptyList())
                    .build();
        }

        List<IncompatibilityRule> violatedRules = ruleRepository.findIncompatibilitiesAmongAssets(assetIds);

        if (violatedRules.isEmpty()) {
            return CompatibilityCheckResponseDto.builder()
                    .compatible(true)
                    .conflicts(Collections.emptyList())
                    .build();
        }

        List<CompatibilityCheckResponseDto.ConflictDetail> conflicts = violatedRules.stream()
                .map(rule -> CompatibilityCheckResponseDto.ConflictDetail.builder()
                        .ruleId(rule.getId())
                        .assetAId(rule.getAssetA().getId())
                        .assetAName(rule.getAssetA().getName())
                        .assetBId(rule.getAssetB().getId())
                        .assetBName(rule.getAssetB().getName())
                        .message(String.format("Conflicto visual [CA-03]: '%s' es incompatible con '%s'. Motivo: %s",
                                rule.getAssetA().getName(),
                                rule.getAssetB().getName(),
                                rule.getReason()))
                        .build())
                .toList();

        return CompatibilityCheckResponseDto.builder()
                .compatible(false)
                .conflicts(conflicts)
                .build();
    }

    /**
     * Consulta de todas las incompatibilidades para un activo específico
     */
    @Transactional(readOnly = true)
    public List<IncompatibilityRuleResponseDto> getConflictsForAsset(Long assetId) {
        return ruleRepository.findByAssetId(assetId).stream()
                .map(IncompatibilityRuleResponseDto::fromEntity)
                .toList();
    }
}
