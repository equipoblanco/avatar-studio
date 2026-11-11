-- ==============================================================================
-- V1__create_categories_and_assets.sql
-- Plataforma Modular de Identidad Digital (Avatares 2D Estáticos Tipo Toonix)
-- Épica 7 / HU-13 (CA-HU01.1 a CA-HU01.5)
-- ==============================================================================

-- 1. Tabla de Categorías Maestras (7 Ranuras Oficiales del Avatar)
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    z_index_default INT NOT NULL,
    default_asset_id BIGINT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_category_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Activos Cosméticos 2D (Sprites y Metadatos)
CREATE TABLE IF NOT EXISTS cosmetic_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    sprite_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500) NOT NULL,
    z_index INT NOT NULL,
    tags JSON NULL,
    status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    supports_tint BOOLEAN NOT NULL DEFAULT FALSE,
    obtainable BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cosmetic_assets_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_cosmetic_asset_status (status),
    INDEX idx_cosmetic_asset_category_status (category_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Llave foránea de respaldo (Fallback) para la pieza predeterminada
ALTER TABLE categories
ADD CONSTRAINT fk_categories_default_asset
FOREIGN KEY (default_asset_id) REFERENCES cosmetic_assets(id) ON DELETE RESTRICT;

-- ==============================================================================
-- Semillas Iniciales: Las 7 Categorías del Avatar Toonix
-- ==============================================================================
INSERT INTO categories (id, code, name, z_index_default, is_required) VALUES
(1, 'cuerpo_base',   'Cuerpo',            10, TRUE),
(2, 'calzado',       'Zapatos',           20, FALSE),
(3, 'ropa_inferior', 'Inferior',          25, FALSE),
(4, 'rostro',        'Rostro',            40, TRUE),
(5, 'ropa_superior', 'Superior',          35, FALSE),
(6, 'accesorios',    'Accesorios',        70, FALSE),
(7, 'peinado',       'Cabello',           50, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- ==============================================================================
-- Semillas Iniciales: Piezas Predeterminadas (Fallback Assets) Toonix
-- Sprites canónicos 512x512 con transparencia estilo Cartoon Network Toonix
-- ==============================================================================
INSERT INTO cosmetic_assets (id, category_id, name, sprite_url, thumbnail_url, z_index, tags, status, is_default, supports_tint, obtainable) VALUES
(1, 1, 'Toonix Base Blanco Neutro',  'https://cdn.plataforma.com/sprites/toonix_base_white_512.png',     'https://cdn.plataforma.com/sprites/thumbs/toonix_base_white_128.png',     10, '["base", "toonix", "blanco", "default"]', 'ACTIVE', TRUE, TRUE,  FALSE),
(2, 2, 'Pies Toonix Descalzos',      'https://cdn.plataforma.com/sprites/toonix_barefoot_512.png',       'https://cdn.plataforma.com/sprites/thumbs/toonix_barefoot_128.png',       15, '["pies", "descalzo", "default"]',         'ACTIVE', TRUE, TRUE,  FALSE),
(3, 3, 'Short Básico Toonix Blanco', 'https://cdn.plataforma.com/sprites/toonix_default_shorts_512.png', 'https://cdn.plataforma.com/sprites/thumbs/toonix_default_shorts_128.png', 20, '["short", "inferior", "default"]',       'ACTIVE', TRUE, TRUE,  FALSE),
(4, 4, 'Expresión Toonix Clásica',   'https://cdn.plataforma.com/sprites/toonix_face_neutral_512.png',   'https://cdn.plataforma.com/sprites/thumbs/toonix_face_neutral_128.png',   30, '["rostro", "ojos", "sonrisa", "default"]','ACTIVE', TRUE, FALSE, FALSE),
(5, 5, 'Torso Desnudo Básico',       'https://cdn.plataforma.com/sprites/toonix_empty_transparent.png',  'https://cdn.plataforma.com/sprites/thumbs/toonix_empty_thumb.png',        40, '["torso", "vacio", "default"]',           'ACTIVE', TRUE, FALSE, FALSE),
(6, 6, 'Sin Accesorio',              'https://cdn.plataforma.com/sprites/toonix_empty_transparent.png',  'https://cdn.plataforma.com/sprites/thumbs/toonix_empty_thumb.png',        50, '["accesorio", "vacio", "default"]',       'ACTIVE', TRUE, FALSE, FALSE),
(7, 7, 'Cabeza Calva / Lisa Toonix', 'https://cdn.plataforma.com/sprites/toonix_empty_transparent.png',  'https://cdn.plataforma.com/sprites/thumbs/toonix_empty_thumb.png',        60, '["peinado", "calvo", "default"]',         'ACTIVE', TRUE, FALSE, FALSE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Actualizar referencia de fallback obligatorio en cada categoría
UPDATE categories SET default_asset_id = 1 WHERE id = 1;
UPDATE categories SET default_asset_id = 2 WHERE id = 2;
UPDATE categories SET default_asset_id = 3 WHERE id = 3;
UPDATE categories SET default_asset_id = 4 WHERE id = 4;
UPDATE categories SET default_asset_id = 5 WHERE id = 5;
UPDATE categories SET default_asset_id = 6 WHERE id = 6;
UPDATE categories SET default_asset_id = 7 WHERE id = 7;

