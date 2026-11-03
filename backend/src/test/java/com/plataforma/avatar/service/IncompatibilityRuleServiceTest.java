package com.plataforma.avatar.service;

import com.plataforma.avatar.dto.*;
import com.plataforma.avatar.model.Asset;
import com.plataforma.avatar.model.Category;
import com.plataforma.avatar.model.IncompatibilityRule;
import com.plataforma.avatar.repository.AssetRepository;
import com.plataforma.avatar.repository.IncompatibilityRuleRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncompatibilityRuleServiceTest {

    @Mock
    private IncompatibilityRuleRepository ruleRepository;

    @Mock
    private AssetRepository assetRepository;

    @InjectMocks
    private IncompatibilityRuleService ruleService;

    private Category catSombreros;
    private Category catPeinados;
    private Asset assetSombreroGrande;
    private Asset assetPeinadoVoluminoso;
    private IncompatibilityRule ruleSombreroPeinado;

    @BeforeEach
    void setUp() {
        catSombreros = Category.builder()
                .id(6L)
                .code("accesorios")
                .name("Accesorios")
                .zIndexDefault(50)
                .build();

        catPeinados = Category.builder()
                .id(7L)
                .code("peinado")
                .name("Peinado / Cabeza")
                .zIndexDefault(60)
                .build();

        assetSombreroGrande = Asset.builder()
                .id(10L)
                .category(catSombreros)
                .name("Sombrero de Mago Grande")
                .spriteUrl("https://cdn.plataforma.com/sprites/sombrero_10.png")
                .zIndex(52)
                .build();

        assetPeinadoVoluminoso = Asset.builder()
                .id(25L)
                .category(catPeinados)
                .name("Peinado Afro Voluminoso")
                .spriteUrl("https://cdn.plataforma.com/sprites/peinado_25.png")
                .zIndex(60)
                .build();

        ruleSombreroPeinado = IncompatibilityRule.builder()
                .id(1L)
                .assetA(assetSombreroGrande)
                .assetB(assetPeinadoVoluminoso)
                .reason("Colisión de volumen 2D: El afro atraviesa la copa del sombrero")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("CA-HU14.1 / CA-03: Creación de regla con orden canónico (assetA.id < assetB.id)")
    void testCreateRule_Success() {
        IncompatibilityRuleRequestDto request = IncompatibilityRuleRequestDto.builder()
                .assetAId(25L) // Enviar en orden invertido para comprobar canonicidad
                .assetBId(10L)
                .reason("Colisión de volumen 2D: El afro atraviesa la copa del sombrero")
                .build();

        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroGrande));
        when(assetRepository.findById(25L)).thenReturn(Optional.of(assetPeinadoVoluminoso));
        when(ruleRepository.existsByAssetAIdAndAssetBId(10L, 25L)).thenReturn(false);
        when(ruleRepository.save(any(IncompatibilityRule.class))).thenReturn(ruleSombreroPeinado);

        IncompatibilityRuleResponseDto response = ruleService.createRule(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(10L, response.getAssetAId());
        assertEquals("Sombrero de Mago Grande", response.getAssetAName());
        assertEquals(25L, response.getAssetBId());
        assertEquals("Peinado Afro Voluminoso", response.getAssetBName());
        verify(ruleRepository, times(1)).save(any(IncompatibilityRule.class));
    }

    @Test
    @DisplayName("CA-HU14.1: Rechazar creación si se intenta declarar incompatible un activo consigo mismo")
    void testCreateRule_ThrowsException_WhenSameAsset() {
        IncompatibilityRuleRequestDto request = IncompatibilityRuleRequestDto.builder()
                .assetAId(10L)
                .assetBId(10L)
                .reason("Auto colisión")
                .build();

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> ruleService.createRule(request)
        );

        assertTrue(ex.getMessage().contains("no puede declararse incompatible consigo mismo"));
        verify(ruleRepository, never()).save(any(IncompatibilityRule.class));
    }

    @Test
    @DisplayName("CA-HU14.1: Rechazar par duplicado en MySQL (Par Único)")
    void testCreateRule_ThrowsException_WhenDuplicatePair() {
        IncompatibilityRuleRequestDto request = IncompatibilityRuleRequestDto.builder()
                .assetAId(10L)
                .assetBId(25L)
                .reason("Ya existente")
                .build();

        when(assetRepository.findById(10L)).thenReturn(Optional.of(assetSombreroGrande));
        when(assetRepository.findById(25L)).thenReturn(Optional.of(assetPeinadoVoluminoso));
        when(ruleRepository.existsByAssetAIdAndAssetBId(10L, 25L)).thenReturn(true);

        IllegalStateException ex = assertThrows(
                IllegalStateException.class,
                () -> ruleService.createRule(request)
        );

        assertTrue(ex.getMessage().contains("Ya existe una regla de incompatibilidad"));
        verify(ruleRepository, never()).save(any(IncompatibilityRule.class));
    }

    @Test
    @DisplayName("CA-HU14.2: Consulta de listado de reglas activas")
    void testGetAllRules_Success() {
        when(ruleRepository.findAllWithDetails()).thenReturn(List.of(ruleSombreroPeinado));

        List<IncompatibilityRuleResponseDto> rules = ruleService.getAllRules();

        assertNotNull(rules);
        assertEquals(1, rules.size());
        assertEquals("Sombrero de Mago Grande", rules.get(0).getAssetAName());
        assertEquals("Peinado Afro Voluminoso", rules.get(0).getAssetBName());
    }

    @Test
    @DisplayName("CA-HU14.2 / CA-03: Eliminación de regla de incompatibilidad")
    void testDeleteRule_Success() {
        when(ruleRepository.existsById(1L)).thenReturn(true);
        doNothing().when(ruleRepository).deleteById(1L);

        assertDoesNotThrow(() -> ruleService.deleteRule(1L));
        verify(ruleRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("CA-HU14.2: Error al intentar eliminar una regla inexistente")
    void testDeleteRule_ThrowsNotFound() {
        when(ruleRepository.existsById(999L)).thenReturn(false);

        assertThrows(EntityNotFoundException.class, () -> ruleService.deleteRule(999L));
        verify(ruleRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("CA-03 / HU-09: Bloqueo inmediato en el editor ante colisión de activos con regla activa")
    void testValidateCompatibility_WhenRuleActive_BlocksImmediate() {
        List<Long> equippedAssetIds = List.of(10L, 25L, 1L); // Sombrero + Afro + Cuerpo base

        when(ruleRepository.findIncompatibilitiesAmongAssets(equippedAssetIds))
                .thenReturn(List.of(ruleSombreroPeinado));

        CompatibilityCheckResponseDto result = ruleService.validateCompatibility(equippedAssetIds);

        assertFalse(result.isCompatible(), "La combinación debe ser BLOQUEADA de inmediato por el motor de validación.");
        assertEquals(1, result.getConflicts().size());
        assertTrue(result.getConflicts().get(0).getMessage().contains("Conflicto visual [CA-03]"));
        assertTrue(result.getConflicts().get(0).getMessage().contains("Sombrero de Mago Grande"));
        assertTrue(result.getConflicts().get(0).getMessage().contains("Peinado Afro Voluminoso"));
    }

    @Test
    @DisplayName("CA-03 / HU-09: Desbloqueo y compatibilidad inmediata tras eliminar o no existir la regla")
    void testValidateCompatibility_WhenNoRulesViolated_AllowsImmediate() {
        List<Long> equippedAssetIds = List.of(10L, 25L, 1L);

        // Sin reglas activas encontradas (ej. tras dar de baja la regla)
        when(ruleRepository.findIncompatibilitiesAmongAssets(equippedAssetIds))
                .thenReturn(Collections.emptyList());

        CompatibilityCheckResponseDto result = ruleService.validateCompatibility(equippedAssetIds);

        assertTrue(result.isCompatible(), "La combinación debe ser PERMITIDA sin restricciones.");
        assertTrue(result.getConflicts().isEmpty());
    }
}
