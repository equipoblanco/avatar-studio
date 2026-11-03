package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.CatalogAssetResponseDto;
import com.plataforma.avatar.dto.CategoryResponseDto;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import com.plataforma.avatar.repository.UserInventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserInventoryRepository userInventoryRepository;

    @InjectMocks
    private CatalogService catalogService;

    private Category catCuerpo;
    private Category catPeinado;
    private Category catRopaSup;

    private Asset assetBaseBlanco;
    private Asset assetGorraUrbana;
    private Asset assetHoodieCyan;
    private Asset assetCamisaBloqueada;

    @BeforeEach
    void setUp() {
        catCuerpo = Category.builder()
                .id(1L)
                .code("cuerpo_base")
                .name("Cuerpo / Base")
                .zIndexDefault(10)
                .build();

        catRopaSup = Category.builder()
                .id(5L)
                .code("ropa_superior")
                .name("Ropa Superior")
                .zIndexDefault(40)
                .build();

        catPeinado = Category.builder()
                .id(7L)
                .code("peinado")
                .name("Peinado / Cabeza")
                .zIndexDefault(60)
                .build();

        assetBaseBlanco = Asset.builder()
                .id(1L)
                .category(catCuerpo)
                .name("Toonix Base Blanco Neutro")
                .spriteUrl("https://cdn.plataforma.com/sprites/toonix_base.png")
                .zIndex(10)
                .tags(List.of("base", "toonix", "blanco"))
                .status(AssetStatus.ACTIVE)
                .isDefault(true)
                .build();

        assetGorraUrbana = Asset.builder()
                .id(8L)
                .category(catPeinado)
                .name("Gorra Toonix Urbana Negra")
                .spriteUrl("https://cdn.plataforma.com/sprites/cap.png")
                .zIndex(62)
                .tags(List.of("gorra", "urbano", "calle"))
                .status(AssetStatus.ACTIVE)
                .isDefault(false)
                .build();

        assetHoodieCyan = Asset.builder()
                .id(9L)
                .category(catRopaSup)
                .name("Sudadera Hoodie Cyan")
                .spriteUrl("https://cdn.plataforma.com/sprites/hoodie.png")
                .zIndex(42)
                .tags(List.of("sudadera", "hoodie", "cyan"))
                .status(AssetStatus.ACTIVE)
                .isDefault(false)
                .build();

        assetCamisaBloqueada = Asset.builder()
                .id(15L)
                .category(catRopaSup)
                .name("Camisa de Lujo")
                .spriteUrl("https://cdn.plataforma.com/sprites/camisa.png")
                .zIndex(41)
                .tags(List.of("camisa", "lujo"))
                .status(AssetStatus.ACTIVE)
                .isDefault(false)
                .build();
    }

    @Test
    @DisplayName("CA-HU06.1: Filtrado de activos disponibles por código de categoría")
    void testFilterByCategoryCode_ReturnsOnlyActiveAssetsOfCategory() {
        when(assetRepository.findByCategoryCodeAndStatusWithCategory("peinado", AssetStatus.ACTIVE))
                .thenReturn(List.of(assetGorraUrbana));

        // Usuario #1 tiene desbloqueado el ID #8 (Gorra)
        when(userInventoryRepository.findUnlockedAssetIdsByUserId(1L))
                .thenReturn(List.of(8L));

        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                null, "peinado", null, 1L, true
        );

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Gorra Toonix Urbana Negra", result.get(0).getName());
        assertEquals("peinado", result.get(0).getCategoryCode());
        assertEquals("UNLOCKED", result.get(0).getAcquisitionType());
        assertTrue(result.get(0).getIsEquipable());
    }

    @Test
    @DisplayName("CA-HU06.1: Cruce con inventario distingue entre default, desbloqueados y bloqueados")
    void testInventoryCrossCheck_IncludesDefaultAndUnlocked_ExcludesLocked() {
        when(assetRepository.findByCategoryIdAndStatusWithCategory(5L, AssetStatus.ACTIVE))
                .thenReturn(List.of(assetHoodieCyan, assetCamisaBloqueada));

        // El usuario #1 solo posee el ID #9 (Hoodie), pero no el ID #15 (Camisa Bloqueada)
        when(userInventoryRepository.findUnlockedAssetIdsByUserId(1L))
                .thenReturn(List.of(9L));

        // availableOnly = true (Modo Editor)
        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                5L, null, null, 1L, true
        );

        assertEquals(1, result.size());
        assertEquals(9L, result.get(0).getId());
        assertEquals("Sudadera Hoodie Cyan", result.get(0).getName());
        assertEquals("UNLOCKED", result.get(0).getAcquisitionType());
    }

    @Test
    @DisplayName("CA-HU06.1: Activos marcados como 'is_default' siempre están disponibles para equipar")
    void testDefaultAssets_AlwaysEquipable_EvenWithoutInventoryEntry() {
        when(assetRepository.findByCategoryCodeAndStatusWithCategory("cuerpo_base", AssetStatus.ACTIVE))
                .thenReturn(List.of(assetBaseBlanco));

        when(userInventoryRepository.findUnlockedAssetIdsByUserId(1L))
                .thenReturn(Collections.emptyList());

        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                null, "cuerpo_base", null, 1L, true
        );

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("DEFAULT", result.get(0).getAcquisitionType());
        assertTrue(result.get(0).getIsEquipable());
    }

    @Test
    @DisplayName("CA-HU06.2: Búsqueda simple por texto que coincide con el nombre del activo")
    void testSearchByText_MatchesName() {
        when(assetRepository.findAllByStatusWithCategory(AssetStatus.ACTIVE))
                .thenReturn(List.of(assetBaseBlanco, assetGorraUrbana, assetHoodieCyan));

        when(userInventoryRepository.findUnlockedAssetIdsByUserId(1L))
                .thenReturn(List.of(8L, 9L));

        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                null, null, "hoodie", 1L, true
        );

        assertEquals(1, result.size());
        assertEquals("Sudadera Hoodie Cyan", result.get(0).getName());
    }

    @Test
    @DisplayName("CA-HU06.2: Búsqueda simple por texto que coincide con una etiqueta (tag)")
    void testSearchByText_MatchesTag() {
        when(assetRepository.findAllByStatusWithCategory(AssetStatus.ACTIVE))
                .thenReturn(List.of(assetBaseBlanco, assetGorraUrbana, assetHoodieCyan));

        when(userInventoryRepository.findUnlockedAssetIdsByUserId(1L))
                .thenReturn(List.of(8L, 9L));

        // "calle" es una etiqueta de la Gorra Toonix Urbana, no está en su nombre
        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                null, null, "calle", 1L, true
        );

        assertEquals(1, result.size());
        assertEquals("Gorra Toonix Urbana Negra", result.get(0).getName());
    }

    @Test
    @DisplayName("CA-HU06.3: Búsqueda sin resultados devuelve lista vacía para activar mensaje en frontend")
    void testSearchByText_NoMatches_ReturnsEmptyList() {
        when(assetRepository.findAllByStatusWithCategory(AssetStatus.ACTIVE))
                .thenReturn(List.of(assetBaseBlanco, assetGorraUrbana, assetHoodieCyan));

        List<CatalogAssetResponseDto> result = catalogService.getCatalogAssets(
                null, null, "palabra_inexistente_xyz", 1L, true
        );

        assertNotNull(result);
        assertTrue(result.isEmpty(), "Debe retornar lista vacía para que el frontend dispare el estado 'No se encontraron resultados'.");
    }

    @Test
    @DisplayName("CA-HU06.1: Consulta de categorías maestras ordenadas por Z-Index")
    void testGetCategories_ReturnsSortedCategories() {
        when(categoryRepository.findAll()).thenReturn(List.of(catPeinado, catCuerpo, catRopaSup));

        List<CategoryResponseDto> categories = catalogService.getCategories();

        assertEquals(3, categories.size());
        assertEquals(10, categories.get(0).getZIndexDefault()); // Cuerpo (10)
        assertEquals(40, categories.get(1).getZIndexDefault()); // Ropa Sup (40)
        assertEquals(60, categories.get(2).getZIndexDefault()); // Peinado (60)
    }
}
