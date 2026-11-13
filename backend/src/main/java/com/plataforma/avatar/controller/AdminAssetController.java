package com.plataforma.avatar.controller;

import com.plataforma.avatar.dto.AssetRequestDto;
import com.plataforma.avatar.dto.AssetResponseDto;
import com.plataforma.avatar.dto.AssetStatusUpdateDto;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.service.AssetService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/assets")
@PreAuthorize("hasRole('ADMIN')")
public class AdminAssetController {

    private final AssetService assetService;

    public AdminAssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    /**
     * CA-HU01.1: Alta de activo cosmético 2D con archivo gráfico multipart
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetResponseDto> createAsset(
            @ModelAttribute @Valid AssetRequestDto data,
            @RequestPart("file") MultipartFile file) {
        AssetResponseDto response = assetService.createAsset(data, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * CA-HU01.2: Edición de metadatos y reemplazo opcional de sprite
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AssetResponseDto> updateAsset(
            @PathVariable Long id,
            @ModelAttribute @Valid AssetRequestDto data,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        AssetResponseDto response = assetService.updateAsset(id, data, file);
        return ResponseEntity.ok(response);
    }

    /**
     * CA-HU01.3: Desactivación / Activación lógica en caliente (Baja Lógica /
     * Fallback)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<AssetResponseDto> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid AssetStatusUpdateDto statusDto) {
        AssetResponseDto response = assetService.updateStatus(id, statusDto.getStatus());
        return ResponseEntity.ok(response);
    }

    /**
     * Consulta y filtrado paginado de activos del catálogo
     */
    @GetMapping
    public ResponseEntity<Page<AssetResponseDto>> getAssets(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) AssetStatus status,
            @RequestParam(required = false) String query,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(assetService.getAssets(categoryId, status, query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetResponseDto> getAssetById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getAssetById(id));
    }

    /**
     * NUEVO: Eliminación física de un activo del catálogo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}