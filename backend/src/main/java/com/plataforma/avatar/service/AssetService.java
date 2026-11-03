package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.AssetRequestDto;
import com.plataforma.avatar.dto.AssetResponseDto;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final FileValidationService fileValidationService;
    private final FileStorageService fileStorageService;

    public AssetService(
            AssetRepository assetRepository,
            CategoryRepository categoryRepository,
            FileValidationService fileValidationService,
            FileStorageService fileStorageService
    ) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.fileValidationService = fileValidationService;
        this.fileStorageService = fileStorageService;
    }

    /**
     * CA-HU01.1: Alta de activo y validación técnica del sprite 2D (512x512, canal alfa, PNG/WebP)
     */
    public AssetResponseDto createAsset(AssetRequestDto dto, MultipartFile spriteFile) {
        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        // Validación estricta del archivo gráfico
        BufferedImage validatedImage = fileValidationService.validateSpriteFile(spriteFile);

        // Almacenamiento en CDN/S3
        FileStorageService.StoredAssetFiles storedFiles = fileStorageService.storeAssetSprite(spriteFile, validatedImage);

        Asset asset = Asset.builder()
                .category(category)
                .name(dto.getName())
                .spriteUrl(storedFiles.spriteUrl())
                .thumbnailUrl(storedFiles.thumbnailUrl())
                .zIndex(dto.getZIndex() != null ? dto.getZIndex() : category.getZIndexDefault())
                .tags(dto.getTags())
                .status(AssetStatus.ACTIVE)
                .isDefault(Boolean.TRUE.equals(dto.getIsDefault()))
                .supportsTint(Boolean.TRUE.equals(dto.getSupportsTint()))
                .obtainable(Boolean.TRUE.equals(dto.getObtainable()))
                .build();

        Asset savedAsset = assetRepository.save(asset);

        // Si se marca como default, actualizar la referencia de fallback de la categoría
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            category.setDefaultAsset(savedAsset);
            categoryRepository.save(category);
        }

        return AssetResponseDto.fromEntity(savedAsset);
    }

    /**
     * CA-HU01.2: Edición de activo y actualización opcional de sprite
     */
    public AssetResponseDto updateAsset(Long assetId, AssetRequestDto dto, MultipartFile optionalSpriteFile) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + assetId));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new EntityNotFoundException("Categoría no encontrada con ID: " + dto.getCategoryId()));

        asset.setCategory(category);
        asset.setName(dto.getName());
        asset.setZIndex(dto.getZIndex());
        asset.setTags(dto.getTags());
        asset.setSupportsTint(Boolean.TRUE.equals(dto.getSupportsTint()));
        asset.setObtainable(Boolean.TRUE.equals(dto.getObtainable()));

        if (optionalSpriteFile != null && !optionalSpriteFile.isEmpty()) {
            BufferedImage validatedImage = fileValidationService.validateSpriteFile(optionalSpriteFile);
            FileStorageService.StoredAssetFiles storedFiles = fileStorageService.storeAssetSprite(optionalSpriteFile, validatedImage);
            asset.setSpriteUrl(storedFiles.spriteUrl());
            asset.setThumbnailUrl(storedFiles.thumbnailUrl());
        }

        Asset updatedAsset = assetRepository.save(asset);
        return AssetResponseDto.fromEntity(updatedAsset);
    }

    /**
     * CA-HU01.3: Desactivación lógica en caliente (Baja Lógica / Soft Delete) y Fallback [CA-07]
     */
    public AssetResponseDto updateStatus(Long assetId, AssetStatus newStatus) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + assetId));

        if (newStatus == AssetStatus.INACTIVE) {
            // Regla de Negocio: No se puede desactivar la pieza que actualmente sirve como fallback de la categoría
            Category category = asset.getCategory();
            if (category.getDefaultAsset() != null && category.getDefaultAsset().getId().equals(asset.getId())) {
                throw new IllegalStateException(
                        "Conflicto de Fallback: No se puede desactivar el activo ID " + assetId +
                        " porque es la pieza predeterminada de la categoría '" + category.getName() +
                        "'. Asigne primero un nuevo activo predeterminado antes de dar de baja este ítem."
                );
            }
        }

        asset.setStatus(newStatus);
        Asset savedAsset = assetRepository.save(asset);
        return AssetResponseDto.fromEntity(savedAsset);
    }

    /**
     * Consulta con paginación y filtros para el Backoffice
     */
    @Transactional(readOnly = true)
    public Page<AssetResponseDto> getAssets(Long categoryId, AssetStatus status, String query, Pageable pageable) {
        return assetRepository.searchAssets(categoryId, status, query, pageable)
                .map(AssetResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public AssetResponseDto getAssetById(Long assetId) {
        return assetRepository.findById(assetId)
                .map(AssetResponseDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Activo no encontrado con ID: " + assetId));
    }
}

