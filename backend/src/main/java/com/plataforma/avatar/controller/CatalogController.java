package com.plataforma.avatar.controller;

import com.plataforma.avatar.dto.CatalogAssetResponseDto;
import com.plataforma.avatar.dto.CategoryResponseDto;
import com.plataforma.avatar.service.CatalogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/catalog", "/api/v1/catalog"})
public class CatalogController {

    private final CatalogService catalogService;

    public CatalogController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /**
     * CA-HU06.1, CA-HU06.2, CA-HU06.3:
     * Endpoint público para explorar el catálogo desde el Editor de avatares con:
     * - Filtro por las 7 categorías (ID o código)
     * - Búsqueda por texto libre (nombre o etiquetas)
     * - Cruce automático con inventario de usuario (piezas disponibles)
     */
    @GetMapping("/assets")
    public ResponseEntity<List<CatalogAssetResponseDto>> getCatalogAssets(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String categoryCode,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false, defaultValue = "true") Boolean availableOnly
    ) {
        List<CatalogAssetResponseDto> assets = catalogService.getCatalogAssets(
                categoryId,
                categoryCode,
                query,
                userId,
                availableOnly
        );
        return ResponseEntity.ok(assets);
    }

    /**
     * Consulta pública de las 7 categorías maestras para renderizar las pestañas del Editor
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponseDto>> getCategories() {
        return ResponseEntity.ok(catalogService.getCategories());
    }
}
