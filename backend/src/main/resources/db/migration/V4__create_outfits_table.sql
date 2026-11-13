-- ==============================================================================
-- V4__create_outfits_table.sql
-- Plataforma Modular de Identidad Digital (Avatar Studio 2D)
-- Épica 4 / HU-09 — Validación Integral de Equipamiento y Compatibilidad de Piezas
-- Épica 5 / HU-10 — Persistencia de Manifiestos JSON en MySQL (CA-02, CA-03, CA-06)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS outfits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    skin_color VARCHAR(10) NOT NULL DEFAULT '#FFFFFF',
    manifest JSON NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_outfits_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
