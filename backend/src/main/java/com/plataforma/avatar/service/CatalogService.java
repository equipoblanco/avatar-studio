package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.CatalogAssetResponseDto;
import com.plataforma.avatar.dto.CategoryResponseDto;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import com.plataforma.avatar.repository.UserInventoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional(readOnly = true)
public class CatalogService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final UserInventoryRepository userInventoryRepository;

    public CatalogService(
            AssetRepository assetRepository,
            CategoryRepository categoryRepository,
            UserInventoryRepository userInventoryRepository
    ) {
        this.assetRepository = assetRepository;
        this.categoryRepository = categoryRepository;
        this.userInventoryRepository = userInventoryRepository;
    }

    /**
     * CA-HU06.1 / CA-HU06.2 / CA-HU06.3:
     * Exploración, filtrado por las 7 categorías, búsqueda por nombre o etiqueta,
     * y cruce con inventario del usuario para determinar piezas equipables.
     */
    public List<CatalogAssetResponseDto> getCatalogAssets(
            Long categoryId,
            String categoryCode,
            String query,
            Long userId,
            Boolean availableOnly
    ) {
        // 1. Obtener activos estrictamente en estado "ACTIVE" según la categoría
        List<Asset> rawAssets;
        if (categoryId != null) {
            rawAssets = assetRepository.findByCategoryIdAndStatusWithCategory(categoryId, AssetStatus.ACTIVE);
        } else if (categoryCode != null && !categoryCode.trim().isEmpty()) {
            rawAssets = assetRepository.findByCategoryCodeAndStatusWithCategory(categoryCode.trim(), AssetStatus.ACTIVE);
        } else {
            rawAssets = assetRepository.findAllByStatusWithCategory(AssetStatus.ACTIVE);
        }

        // 2. Cruce con inventario del usuario para verificar cosméticos desbloqueados
        Set<Long> unlockedAssetIds = Collections.emptySet();
        if (userId != null) {
            unlockedAssetIds = new HashSet<>(userInventoryRepository.findUnlockedAssetIdsByUserId(userId));
        }

        boolean requireAvailableOnly = availableOnly == null || availableOnly;
        String searchTerm = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;

        List<CatalogAssetResponseDto> result = new ArrayList<>();

        for (Asset asset : rawAssets) {
            boolean isDefault = Boolean.TRUE.equals(asset.getIsDefault());
            boolean isUnlockedInInventory = unlockedAssetIds.contains(asset.getId());
            boolean isEquipable = isDefault || isUnlockedInInventory;

            String acquisitionType;
            if (isDefault) {
                acquisitionType = "DEFAULT";
            } else if (isUnlockedInInventory) {
                acquisitionType = "UNLOCKED";
            } else {
                acquisitionType = "LOCKED";
            }

            // CA-HU06.1: Si se solicitan solo disponibles, omitir los que no están en inventario ni son default
            if (requireAvailableOnly && !isEquipable) {
                continue;
            }

            // CA-HU06.2: Búsqueda simple por texto en nombre o etiquetas
            if (searchTerm != null) {
                boolean matchesName = asset.getName().toLowerCase().contains(searchTerm);
                boolean matchesTag = asset.getTags() != null && asset.getTags().stream()
                        .anyMatch(tag -> tag != null && tag.toLowerCase().contains(searchTerm));

                if (!matchesName && !matchesTag) {
                    continue;
                }
            }

            result.add(CatalogAssetResponseDto.fromEntity(asset, isEquipable, acquisitionType));
        }

        return result;
    }

    /**
     * Listado público de las 7 categorías maestras para el selector del Editor
     */
    public List<CategoryResponseDto> getCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparingInt(c -> c.getZIndexDefault()))
                .map(CategoryResponseDto::fromEntity)
                .toList();
    }
}
