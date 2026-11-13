-- ==============================================================================
-- V3__catalog_search_indexes_and_inventory.sql
-- Plataforma Modular de Identidad Digital (Avatar Studio 2D)
-- Épica 3 / HU-06 — Exploración, Filtrado y Búsqueda en el Catálogo de 7 Categorías
-- ==============================================================================

-- 1. Índices optimizados en 'cosmetic_assets' para filtrado de alta velocidad por:
--    Categoría, Estado 'ACTIVE', Z-Index, Nombre y Accesibilidad
CREATE INDEX idx_assets_catalog_category_status 
ON cosmetic_assets (category_id, status, is_default);

CREATE INDEX idx_assets_name_search 
ON cosmetic_assets (status, name);

CREATE INDEX idx_assets_status_zindex 
ON cosmetic_assets (status, z_index);

-- 2. Tabla de Inventario de Usuario ('user_inventory')
--    Permite el cruce de pertenencia para determinar qué activos puede equipar cada usuario (CA-HU06.1)
CREATE TABLE IF NOT EXISTS user_inventory (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    asset_id BIGINT NOT NULL,
    unlocked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_inventory_asset FOREIGN KEY (asset_id) REFERENCES cosmetic_assets(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_asset UNIQUE (user_id, asset_id),
    INDEX idx_user_inventory_lookup (user_id, asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- Semillas de Prueba para QA: Activos adicionales y desbloqueo en inventario
-- ==============================================================================

-- Activo adicional para Peinado (categoría 7)
INSERT INTO cosmetic_assets (id, category_id, name, sprite_url, thumbnail_url, z_index, tags, status, is_default, supports_tint, obtainable)
VALUES (8, 7, 'Gorra Toonix Urbana Negra', 'https://cdn.plataforma.com/sprites/toonix_cap_urban_512.png', 'https://cdn.plataforma.com/sprites/thumbs/toonix_cap_urban_128.png', 62, '["gorra", "urbano", "peinado", "negro", "calle"]', 'ACTIVE', FALSE, FALSE, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Activo adicional para Ropa Superior (categoría 5)
INSERT INTO cosmetic_assets (id, category_id, name, sprite_url, thumbnail_url, z_index, tags, status, is_default, supports_tint, obtainable)
VALUES (9, 5, 'Sudadera Hoodie Cyan', 'https://cdn.plataforma.com/sprites/toonix_hoodie_cyan_512.png', 'https://cdn.plataforma.com/sprites/thumbs/toonix_hoodie_cyan_128.png', 42, '["sudadera", "hoodie", "cyan", "superior", "invierno"]', 'ACTIVE', FALSE, TRUE, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Activo INACTIVO de prueba (para verificar que nunca aparece en HU-06)
INSERT INTO cosmetic_assets (id, category_id, name, sprite_url, thumbnail_url, z_index, tags, status, is_default, supports_tint, obtainable)
VALUES (10, 5, 'Remera Antigua Descontinuada', 'https://cdn.plataforma.com/sprites/toonix_old_shirt.png', 'https://cdn.plataforma.com/sprites/thumbs/toonix_old_shirt_thumb.png', 40, '["remera", "antiguo", "inactivo"]', 'INACTIVE', FALSE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Usuario #1 tiene desbloqueada la Gorra Toonix Urbana (#8) en su inventario
INSERT INTO user_inventory (user_id, asset_id)
VALUES (1, 8)
ON DUPLICATE KEY UPDATE asset_id=VALUES(asset_id);
