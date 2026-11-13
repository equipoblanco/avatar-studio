package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.AssetRequestDto;
import com.plataforma.avatar.dto.AssetResponseDto;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.AssetStatus;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.awt.image.BufferedImage;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssetServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private FileValidationService fileValidationService;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private AssetService assetService;

    private Category categoryCuerpo;
    private Asset defaultAsset;

    @BeforeEach
    void setUp() {
        categoryCuerpo = Category.builder()
                .id(1L)
                .code("cuerpo_base")
                .name("Cuerpo / Base")
                .zIndexDefault(10)
                .isRequired(true)
                .build();

        defaultAsset = Asset.builder()
                .id(1L)
                .category(categoryCuerpo)
                .name("Toonix Base Blanco Neutro")
                .spriteUrl("https://cdn.plataforma.com/sprites/toonix_base.png")
                .thumbnailUrl("https://cdn.plataforma.com/sprites/thumbs/toonix_base_thumb.png")
                .zIndex(10)
                .status(AssetStatus.ACTIVE)
                .isDefault(true)
                .build();

        categoryCuerpo.setDefaultAsset(defaultAsset);
    }

    @Test
    @DisplayName("CA-HU01.1: Alta de activo válida con sprite 512x512 y metadatos")
    void testCreateAsset_Success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "sprite.png", "image/png", new byte[]{1, 2, 3}
        );

        AssetRequestDto dto = AssetRequestDto.builder()
                .categoryId(1L)
                .name("Toonix Piel Morena")
                .zIndex(10)
                .tags(List.of("piel", "morena", "toonix"))
                .supportsTint(true)
                .isDefault(false)
                .build();

        BufferedImage mockImage = new BufferedImage(512, 512, BufferedImage.TYPE_INT_ARGB);
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryCuerpo));
        when(fileValidationService.validateSpriteFile(file)).thenReturn(mockImage);
        when(fileStorageService.storeAssetSprite(file, mockImage)).thenReturn(
                new FileStorageService.StoredAssetFiles("https://cdn.plataforma.com/sprites/asset2.png", "https://cdn.plataforma.com/sprites/thumbs/asset2_thumb.png")
        );
        when(assetRepository.save(any(Asset.class))).thenAnswer(invocation -> {
            Asset a = invocation.getArgument(0);
            a.setId(2L);
            return a;
        });

        AssetResponseDto response = assetService.createAsset(dto, file);

        assertNotNull(response);
        assertEquals(2L, response.getId());
        assertEquals("Toonix Piel Morena", response.getName());
        assertEquals(AssetStatus.ACTIVE, response.getStatus());
        verify(assetRepository, times(1)).save(any(Asset.class));
    }

    @Test
    @DisplayName("CA-HU01.2: Edición de metadatos de un activo existente")
    void testUpdateAsset_Success() {
        Asset existingAsset = Asset.builder()
                .id(5L)
                .category(categoryCuerpo)
                .name("Polera Clásica")
                .zIndex(40)
                .status(AssetStatus.ACTIVE)
                .isDefault(false)
                .build();

        AssetRequestDto updateDto = AssetRequestDto.builder()
                .categoryId(1L)
                .name("Polera Toonix Cyan Modificada")
                .zIndex(42)
                .tags(List.of("polera", "cyan"))
                .build();

        when(assetRepository.findById(5L)).thenReturn(Optional.of(existingAsset));
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(categoryCuerpo));
        when(assetRepository.save(existingAsset)).thenReturn(existingAsset);

        AssetResponseDto response = assetService.updateAsset(5L, updateDto, null);

        assertNotNull(response);
        assertEquals("Polera Toonix Cyan Modificada", response.getName());
        assertEquals(42, response.getZIndex());
        verify(assetRepository, times(1)).save(existingAsset);
    }

    @Test
    @DisplayName("CA-HU01.3: Baja lógica en caliente exitosa (Soft Delete)")
    void testUpdateStatus_ToInactive_Success() {
        Asset regularAsset = Asset.builder()
                .id(8L)
                .category(categoryCuerpo)
                .name("Gorra Retro")
                .status(AssetStatus.ACTIVE)
                .isDefault(false)
                .build();

        when(assetRepository.findById(8L)).thenReturn(Optional.of(regularAsset));
        when(assetRepository.save(regularAsset)).thenReturn(regularAsset);

        AssetResponseDto response = assetService.updateStatus(8L, AssetStatus.INACTIVE);

        assertEquals(AssetStatus.INACTIVE, response.getStatus());
        verify(assetRepository, times(1)).save(regularAsset);
        // Garantiza que NO se invoque delete físico
        verify(assetRepository, never()).delete(any(Asset.class));
    }

    @Test
    @DisplayName("CA-HU01.3 / CA-07: Bloqueo de baja lógica si el activo es el fallback actual de la categoría")
    void testUpdateStatus_ThrowsConflict_WhenAssetIsDefaultFallback() {
        when(assetRepository.findById(1L)).thenReturn(Optional.of(defaultAsset));

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> assetService.updateStatus(1L, AssetStatus.INACTIVE)
        );

        assertTrue(ex.getMessage().contains("Conflicto de Fallback"));
        verify(assetRepository, never()).save(any(Asset.class));
    }
}

