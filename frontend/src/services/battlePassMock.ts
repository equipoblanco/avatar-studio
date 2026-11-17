import {
  BattlePassPage,
  BattlePassReward,
  BattlePassSeason,
  RewardRarity,
} from '../types/battlePass';

/**
 * ==========================================================================================
 * DATOS MOCK DEL PASE DE BATALLA
 * ==========================================================================================
 * Datos de demostración 100% en frontend, deterministas (sin Math.random) para que las
 * recompensas no cambien entre renders. Cuando haya backend, este archivo se reemplaza por
 * llamadas REST manteniendo las mismas interfaces.
 */

/** Puntos iniciales del jugador (demo). */
export const STARTING_POINTS = 100;

/** Puntos que hay que gastar en cada página para desbloquear la siguiente. */
export const POINTS_TO_UNLOCK_NEXT = 60;

/** Recompensas por página (cuadrícula 4×3). */
const REWARDS_PER_PAGE = 12;

const PAGE_THEMES: { title: string; subtitle: string }[] = [
  { title: 'Desembarco', subtitle: 'Primeros recursos de la temporada' },
  { title: 'Zona Urbana', subtitle: 'Estilo callejero para tu avatar' },
  { title: 'Laboratorio', subtitle: 'Experimentos visuales y rarezas altas' },
  { title: 'Órbita', subtitle: 'Recompensas legendarias de la temporada' },
];

/** Coste asociado a cada rareza. */
const COST_BY_RARITY: Record<RewardRarity, number> = {
  common: 5,
  rare: 10,
  epic: 20,
  legendary: 35,
};

// Nombres placeholder de cosméticos — serán reemplazados por assets reales del catálogo.
const COSMETIC_POOL: { name: string; kind: string }[] = [
  { name: 'Cabello Galaxy', kind: 'Cabello' },
  { name: 'Gorra Neón', kind: 'Accesorio' },
  { name: 'Hoodie Estático', kind: 'Ropa superior' },
  { name: 'Botas Orbinales', kind: 'Calzado' },
  { name: 'Alas de Neón', kind: 'Accesorio' },
  { name: 'Pantalón Táctico', kind: 'Ropa inferior' },
  { name: 'Visor Cibernético', kind: 'Accesorio' },
  { name: 'Melena Solar', kind: 'Cabello' },
  { name: 'Chaqueta Pixel', kind: 'Ropa superior' },
  { name: 'Sneakers Vector', kind: 'Calzado' },
  { name: 'Capa Androide', kind: 'Accesorio' },
  { name: 'Falda Prismática', kind: 'Ropa inferior' },
  { name: 'Bigote Glitch', kind: 'Accesorio' },
  { name: 'Peinado Turbo', kind: 'Cabello' },
  { name: 'Zapatos Gravedad', kind: 'Calzado' },
  { name: 'Corona Toonix', kind: 'Accesorio' },
];

/** Rareza determinista por posición en la cuadrícula. */
const rarityFor = (pageId: number, slot: number): RewardRarity => {
  const k = (slot + pageId * 3) % 12;
  if (k === 9) return 'legendary';
  if (k === 5 || k === 10) return 'epic';
  if (k % 2 === 0) return 'rare';
  return 'common';
};

const buildReward = (pageId: number, slot: number): BattlePassReward => {
  const rarity = rarityFor(pageId, slot);
  const cost = COST_BY_RARITY[rarity];
  const id = `p${pageId}-s${slot}`;

  // Cada página lleva una recompensa de monedas (la 8ª posición)
  if (slot === 7) {
    return {
      id,
      type: 'currency',
      rarity,
      name: 'Monedas Toonix',
      cost,
      quantity: 100 + cost * 10,
    };
  }

  const pick = COSMETIC_POOL[(pageId * 5 + slot) % COSMETIC_POOL.length];
  return { id, type: 'cosmetic', rarity, name: pick.name, cost, kind: pick.kind };
};

/** Genera las páginas de la temporada. */
const buildPages = (): BattlePassPage[] =>
  PAGE_THEMES.map((theme, i) => {
    const pageId = i + 1;
    const isLast = pageId === PAGE_THEMES.length;
    return {
      id: pageId,
      title: theme.title,
      subtitle: theme.subtitle,
      pointsToUnlockNext: isLast ? 0 : POINTS_TO_UNLOCK_NEXT,
      rewards: Array.from({ length: REWARDS_PER_PAGE }, (_, slot) => buildReward(pageId, slot)),
    };
  });

export const SEASON: BattlePassSeason = {
  id: 'temporada-01',
  name: 'Temporada 1 · Ascenso Toonix',
  subtitle: 'Gasta tus puntos en los cosméticos que quieras',
  startDate: '2026-11-01T00:00:00',
  endDate: '2026-12-31T23:59:59',
  pages: buildPages(),
};

/** Días restantes de la temporada (nunca negativo). */
export const getDaysRemaining = (): number => {
  const diff = new Date(SEASON.endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
};
