package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.EquipmentValidationResultDto;
import com.plataforma.avatar.dto.OutfitManifestDto;
import com.plataforma.avatar.dto.OutfitSlotDto;
import com.plataforma.avatar.exception.UnprocessableEntityException;
import com.plataforma.avatar.model.*;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.CategoryRepository;
import com.plataforma.avatar.repository.IncompatibilityRuleRepository;
import com.plataforma.avatar.repository.UserInventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EquipmentValidationServiceTest {

    @Mock
    private AssetRepository assetRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserInventoryRepository userInventoryRepository;

    @Mock
    private IncompatibilityRuleRepository incompatibilityRuleRepository;

    @InjectMocks
    private EquipmentValidationService validationService;

    private Category catCuerpo;
    private Category catRostro;
    private Category catPeinado;
    private Category catAccesorios;

    private Asset assetCuerpoBase;
    private Asset assetRostroDefault;
    private Asset assetSombreroMago;
    private Asset assetAfroVoluminoso;
    private Asset assetCamisaInactiva;

    private IncompatibilityRule ruleSombreroAfro;

    @BeforeEach
    void setUp() {
        catCuerpo = Category.builder().id(1L).code("cuerpo_base").name("Cuerpo / Base").isRequired(true).build();
        catRostro = Category.builder().id(4L).code("rostro").name("Rostro").isRequired(true).build();
        catAccesorios = Category.builder().id(6L).code("accesorios").name("Accesorios").isRequired(false).build();
        catPeinado = Category.builder().id(7L).code("peinado").name("Peinado / Cabeza").isRequired(false).build();

        assetCuerpoBase = Asset.builder()
                .id(1L).category(catCuerpo).name("Toonix Base").status(AssetStatus.ACTIVE).isDefault(true).build();

        assetRostroDefault = Asset.builder()
                .id(4L).category(catRostro).name("Rostro Feliz").status(AssetStatus.ACTIVE).isDefault(true).build();

        assetSombreroMago = Asset.builder()
                .id(10L).category(catAccesorios).name("Sombrero de Mago").status(AssetStatus.ACTIVE).isDefault(false).build();

        assetAfroVoluminoso = Asset.builder()
                .id(25L).category(catPeinado).name("Afro Voluminoso").status(AssetStatus.ACTIVE).isDefault(false).build();

        assetCamisaInactiva = Asset.builder()
                .id(99L).category(catCuerpo).name("Pieza Retirada").status(AssetStatus.INACTIVE).isDefault(false).build();

        ruleSombreroAfro = IncompatibilityRule.builder()
                .id(1L).assetA(assetSombreroMago).assetB(assetAfroVoluminoso)
                .reason("Colisión de volumen 2D: El afro atraviesa la copa del sombrero").build();
    }

    @Test
    @DisplayName("CA-HU09.3 / CA-06: Manifiesto JSON válido con unicidad de ranura y piezas desbloqueadas")
    void testValidateOutfitManifest_Success() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));
        slots.put("rostro", new OutfitSlotDto(4L, 30));
        slots.put("accesorios", new OutfitSlotDto(10L, 50));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit de Mago Válido")
                .skinColor("#FFFFFF")
                .slots(slots)
                .build();

        when(assetRepository.findById(1L)).thenReturn(Optional.of(assetCuerpoBase));
        when(assetRepository.findById(4L)).thenReturn(Optional.of(assetRostroDefault));
        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroMago));

        // Usuario #1 posee el Sombrero de Mago (#10) en su inventario
        when(userInventoryRepository.existsByUserIdAndAssetId(1L, 10L)).thenReturn(true);
        when(incompatibilityRuleRepository.findIncompatibilitiesAmongAssets(anyList())).thenReturn(List.of());

        assertDoesNotThrow(() -> validationService.validateOutfitManifestOrThrow(1L, manifest));
    }

    @Test
    @DisplayName("CA-02 / CA-HU09.1: Rechazo defensivo si se especifica una ranura no permitida")
    void testValidateOutfitManifest_ThrowsBadRequest_WhenInvalidSlotName() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));
        slots.put("ranura_inexistente", new OutfitSlotDto(4L, 30));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit Ranura Falsa")
                .slots(slots)
                .build();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("Ranura inválida detectada"));
    }

    @Test
    @DisplayName("CA-02 / CA-HU09.3: Rechazo si se omite la ranura obligatoria 'cuerpo_base'")
    void testValidateOutfitManifest_ThrowsUnprocessable_WhenCuerpoBaseMissing() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("rostro", new OutfitSlotDto(4L, 30));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit Sin Base")
                .slots(slots)
                .build();

        UnprocessableEntityException ex = assertThrows(
                UnprocessableEntityException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("La ranura 'cuerpo_base' es obligatoria"));
    }

    @Test
    @DisplayName("CA-02 / CA-HU09.3: Rechazo si un activo se asigna a una ranura que no es su categoría")
    void testValidateOutfitManifest_ThrowsUnprocessable_WhenAssetAssignedToWrongSlot() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));
        // Intentar meter el Sombrero de Mago (accesorios) en la ranura 'rostro'
        slots.put("rostro", new OutfitSlotDto(10L, 30));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit Cruzado")
                .slots(slots)
                .build();

        when(assetRepository.findById(1L)).thenReturn(Optional.of(assetCuerpoBase));
        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroMago));

        UnprocessableEntityException ex = assertThrows(
                UnprocessableEntityException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("Incoherencia de ranura [CA-02]"));
    }

    @Test
    @DisplayName("CA-07 / CA-HU09.3: Rechazo si el outfit intenta equipar un activo inactivo (Baja Lógica)")
    void testValidateOutfitManifest_ThrowsUnprocessable_WhenAssetIsInactive() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(99L, 10));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit Con Pieza Dada de Baja")
                .slots(slots)
                .build();

        when(assetRepository.findById(99L)).thenReturn(Optional.of(assetCamisaInactiva));

        UnprocessableEntityException ex = assertThrows(
                UnprocessableEntityException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("Activo Inactivo [CA-07]"));
    }

    @Test
    @DisplayName("CA-HU09.3 / CA-08: Rechazo 422 si el usuario intenta equipar un cosmético que no posee")
    void testValidateOutfitManifest_ThrowsUnprocessable_WhenUserDoesNotOwnAsset() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));
        slots.put("accesorios", new OutfitSlotDto(10L, 50));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit No Poseído")
                .slots(slots)
                .build();

        when(assetRepository.findById(1L)).thenReturn(Optional.of(assetCuerpoBase));
        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroMago));
        // Usuario #1 NO posee el Sombrero de Mago
        when(userInventoryRepository.existsByUserIdAndAssetId(1L, 10L)).thenReturn(false);

        UnprocessableEntityException ex = assertThrows(
                UnprocessableEntityException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("Violación de inventario [CA-HU09.3]"));
    }

    @Test
    @DisplayName("CA-03 / CA-HU09.2 / CA-HU09.3: Rechazo 422 si el outfit contiene piezas con regla de colisión activa")
    void testValidateOutfitManifest_ThrowsUnprocessable_WhenIncompatiblePairEquipped() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));
        slots.put("accesorios", new OutfitSlotDto(10L, 50));
        slots.put("peinado", new OutfitSlotDto(25L, 60));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Outfit Con Colisión")
                .slots(slots)
                .build();

        when(assetRepository.findById(1L)).thenReturn(Optional.of(assetCuerpoBase));
        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroMago));
        when(assetRepository.findById(25L)).thenReturn(Optional.of(assetAfroVoluminoso));

        when(userInventoryRepository.existsByUserIdAndAssetId(1L, 10L)).thenReturn(true);
        when(userInventoryRepository.existsByUserIdAndAssetId(1L, 25L)).thenReturn(true);

        // Se detecta colisión entre Sombrero de Mago (10) y Afro Voluminoso (25)
        when(incompatibilityRuleRepository.findIncompatibilitiesAmongAssets(anyList()))
                .thenReturn(List.of(ruleSombreroAfro));

        UnprocessableEntityException ex = assertThrows(
                UnprocessableEntityException.class,
                () -> validationService.validateOutfitManifestOrThrow(1L, manifest)
        );

        assertTrue(ex.getMessage().contains("Bloqueo por incompatibilidad cruzada [CA-03]"));
        assertTrue(ex.getMessage().contains("Sombrero de Mago"));
        assertTrue(ex.getMessage().contains("Afro Voluminoso"));
    }

    @Test
    @DisplayName("Pre-validación no bloqueante para el Editor interactivo")
    void testPreValidateOutfit_ReturnsValidationResultDto() {
        Map<String, OutfitSlotDto> slots = new HashMap<>();
        slots.put("cuerpo_base", new OutfitSlotDto(1L, 10));

        OutfitManifestDto manifest = OutfitManifestDto.builder()
                .name("Pre-check")
                .slots(slots)
                .build();

        when(assetRepository.findById(1L)).thenReturn(Optional.of(assetCuerpoBase));

        EquipmentValidationResultDto result = validationService.validateEquipment(1L, manifest);

        assertTrue(result.isValid());
        assertTrue(result.getErrors().isEmpty());
    }
}
