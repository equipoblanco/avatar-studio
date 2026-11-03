package com.plataforma.avatar.controller;

import com.plataforma.avatar.dto.CategoryResponseDto;
import com.plataforma.avatar.dto.CategoryUpdateDefaultDto;
import com.plataforma.avatar.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/categories")
@PreAuthorize("hasRole('ADMIN')") // CA-HU01.5: Acceso restringido por rol
public class AdminCategoryController {

    private final CategoryService categoryService;

    public AdminCategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    /**
     * CA-HU01.4: Consulta de las 7 categorías maestras
     */
    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponseDto> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    /**
     * CA-HU01.4: Asignación de la pieza predeterminada (default_asset_id) para conciliación por fallback
     */
    @PutMapping("/{id}/default-asset")
    public ResponseEntity<CategoryResponseDto> setDefaultAsset(
            @PathVariable Long id,
            @RequestBody @Valid CategoryUpdateDefaultDto dto
    ) {
        CategoryResponseDto response = categoryService.setDefaultAsset(id, dto.getDefaultAssetId());
        return ResponseEntity.ok(response);
    }
}

