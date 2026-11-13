-- ==============================================================================
-- V2__create_incompatibility_rules.sql
-- Plataforma Modular de Identidad Digital (Avatar Studio 2D)
-- Épica 7 / HU-14 — Gestión de Reglas de Compatibilidad entre Piezas (CA-03)
-- ==============================================================================

-- Tabla de Reglas de Incompatibilidad Cruzada entre Piezas
CREATE TABLE IF NOT EXISTS incompatibility_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_a_id BIGINT NOT NULL,
    asset_b_id BIGINT NOT NULL,
    reason VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Restricciones de integridad relacional hacia el catálogo maestro
    CONSTRAINT fk_incomp_asset_a FOREIGN KEY (asset_a_id) REFERENCES cosmetic_assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_incomp_asset_b FOREIGN KEY (asset_b_id) REFERENCES cosmetic_assets(id) ON DELETE CASCADE,

    -- Restricción de activos distintos (un activo no colisiona consigo mismo)
    CONSTRAINT chk_different_assets CHECK (asset_a_id != asset_b_id),

    -- Restricción de orden canónico para garantizar unicidad bidireccional estricta en MySQL
    -- asset_a_id siempre debe ser menor que asset_b_id
    CONSTRAINT chk_canonical_order CHECK (asset_a_id < asset_b_id),

    -- Restricción de par único: impide registrar A-B o duplicados
    CONSTRAINT uk_incompatibility_pair UNIQUE (asset_a_id, asset_b_id),

    -- Índices para búsqueda bidireccional de alto rendimiento
    INDEX idx_incomp_asset_a (asset_a_id),
    INDEX idx_incomp_asset_b (asset_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
