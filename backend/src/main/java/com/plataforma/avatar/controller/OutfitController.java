package com.plataforma.avatar.controller;

import com.plataforma.avatar.dto.EquipmentValidationResultDto;
import com.plataforma.avatar.dto.OutfitManifestDto;
import com.plataforma.avatar.dto.OutfitResponseDto;
import com.plataforma.avatar.service.OutfitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/outfits", "/api/outfits"})
public class OutfitController {

    private final OutfitService outfitService;

    public OutfitController(OutfitService outfitService) {
        this.outfitService = outfitService;
    }

    /**
     * CA-HU09.3 / CA-06: Persistencia de Outfit con validación integral defensiva
     */
    @PostMapping
    public ResponseEntity<OutfitResponseDto> saveOutfit(
            @RequestBody @Valid OutfitManifestDto manifest,
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        OutfitResponseDto response = outfitService.saveOutfit(userId, manifest);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Pre-validación en tiempo de diseño en el Editor
     */
    @PostMapping("/validate")
    public ResponseEntity<EquipmentValidationResultDto> validateOutfit(
            @RequestBody @Valid OutfitManifestDto manifest,
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        return ResponseEntity.ok(outfitService.preValidateOutfit(userId, manifest));
    }

    /**
     * Listado de guardarropa de outfits
     */
    @GetMapping
    public ResponseEntity<List<OutfitResponseDto>> getUserOutfits(
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        return ResponseEntity.ok(outfitService.getUserOutfits(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OutfitResponseDto> getOutfitById(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Long userId
    ) {
        return ResponseEntity.ok(outfitService.getOutfitById(id, userId));
    }
}
