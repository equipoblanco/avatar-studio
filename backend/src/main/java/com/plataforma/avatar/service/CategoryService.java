package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.CategoryResponseDto;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;

    public CategoryService(CategoryRepository categoryRepository, AssetRepository assetRepository) {
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
    }

    /**
     * CA-HU01.4: Listado de las 7 categorías maestras con su activo de fallback actual
     */
    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDto getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(CategoryResponseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con ID: " + id));
    }

    /**
     * CA-HU01.4: Configuración de la pieza predeterminada (default_asset_id) para conciliación por fallback
     */
    public CategoryResponseDto setDefaultAsset(Long categoryId, Long assetId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con ID: " + categoryId));

        Asset newDefaultAsset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + assetId));

        if (!newDefaultAsset.getCategory().getId().equals(category.getId())) {
            throw new IllegalArgumentException(
                    "El activo ID " + assetId + " pertenece a la categoría '" +
                    newDefaultAsset.getCategory().getName() + "' y no puede ser asignado como default de '" +
                    category.getName() + "'"
            );
        }

        if (newDefaultAsset.getStatus() != AssetStatus.ACTIVE) {
            throw new IllegalStateException(
                    "No se puede asignar un activo INACTIVO como pieza predeterminada de fallback. Activo ID: " + assetId
            );
        }

        // Desmarcar pieza predeterminada previa si existe
        if (category.getDefaultAsset() != null && !category.getDefaultAsset().getId().equals(newDefaultAsset.getId())) {
            Asset oldDefault = category.getDefaultAsset();
            oldDefault.setIsDefault(false);
            assetRepository.save(oldDefault);
        }

        newDefaultAsset.setIsDefault(true);
        assetRepository.save(newDefaultAsset);

        category.setDefaultAsset(newDefaultAsset);
        Category savedCategory = categoryRepository.save(category);

        return CategoryResponseDto.fromEntity(savedCategory);
    }
}

