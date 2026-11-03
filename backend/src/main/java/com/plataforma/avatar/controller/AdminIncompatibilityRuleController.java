package com.plataforma.avatar.controller;

import com.plataforma.avatar.dto.*;
import com.plataforma.avatar.service.IncompatibilityRuleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/incompatibility-rules")
@PreAuthorize("hasRole('ADMIN')") // CA-HU13.5 / Restricción de seguridad de Backoffice
public class AdminIncompatibilityRuleController {

    private final IncompatibilityRuleService ruleService;

    public AdminIncompatibilityRuleController(IncompatibilityRuleService ruleService) {
        this.ruleService = ruleService;
    }

    /**
     * CA-HU14.1: Crear regla de incompatibilidad entre dos piezas
     */
    @PostMapping
    public ResponseEntity<IncompatibilityRuleResponseDto> createRule(
            @RequestBody @Valid IncompatibilityRuleRequestDto dto
    ) {
        IncompatibilityRuleResponseDto response = ruleService.createRule(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * CA-HU14.2: Listado de reglas activas en el Backoffice
     */
    @GetMapping
    public ResponseEntity<List<IncompatibilityRuleResponseDto>> getAllRules() {
        return ResponseEntity.ok(ruleService.getAllRules());
    }

    /**
     * CA-HU14.2: Listado paginado de reglas
     */
    @GetMapping("/page")
    public ResponseEntity<Page<IncompatibilityRuleResponseDto>> getRulesPaged(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ruleService.getRules(pageable));
    }

    /**
     * CA-HU14.2: Eliminar regla de incompatibilidad
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable Long id) {
        ruleService.deleteRule(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * CA-03 / HU-09: Endpoint de validación de compatibilidad para el Editor y Outfits
     */
    @PostMapping("/check")
    public ResponseEntity<CompatibilityCheckResponseDto> checkCompatibility(
            @RequestBody @Valid CompatibilityCheckRequestDto dto
    ) {
        return ResponseEntity.ok(ruleService.validateCompatibility(dto.getAssetIds()));
    }

    /**
     * Consulta de reglas que afectan a un activo
     */
    @GetMapping("/conflicts-for/{assetId}")
    public ResponseEntity<List<IncompatibilityRuleResponseDto>> getConflictsForAsset(
            @PathVariable Long assetId
    ) {
        return ResponseEntity.ok(ruleService.getConflictsForAsset(assetId));
    }
}
