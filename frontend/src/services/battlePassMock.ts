import {
  BattlePassPage,
  BattlePassReward,
  BattlePassSeason,
  RewardRarity,
} from '../types/battlePass';

/**
 * ==========================================================================================
 * STORE DEL PASE DE BATALLA (mock compartido usuario ↔ administración)
 * ==========================================================================================
 * Datos de demostración 100% en frontend, deterministas (sin Math.random) al generarlos.
 * La administración (AdminBattlePassManager) muta este store y la vista de usuario lee de él.
 * Cuando haya backend, este archivo se reemplaza por llamadas REST manteniendo las interfaces.
 */

/** Puntos iniciales del jugador (demo). */
export const STARTING_POINTS = 100;

/** Puntos que hay que gastar en cada página para desbloquear la siguiente. */
export const POINTS_TO_UNLOCK_NEXT = 60;

/** Recompensas por página al crearla (cuadrícula 4×3). */
const REWARDS_PER_PAGE = 12;

const PAGE_THEMES: { title: string; subtitle: string }[] = [
  { title: 'Desembarco', subtitle: 'Primeros recursos de la temporada' },
  { title: 'Zona Urbana', subtitle: 'Estilo callejero para tu avatar' },
  { title: 'Laboratorio', subtitle: 'Experimentos visuales y rarezas altas' },
  { title: 'Órbita', subtitle: 'Recompensas legendarias de la temporada' },
];

/** Coste sugerido asociado a cada rareza. */
export const COST_BY_RARITY: Record<RewardRarity, number> = {
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

/** Rareza determinista por posición en la cuadrícula (al generar la página). */
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
    return { id, type: 'currency', rarity, name: 'Monedas Toonix', cost, quantity: 100 + cost * 10 };
  }

  const pick = COSMETIC_POOL[(pageId * 5 + slot) % COSMETIC_POOL.length];
  return { id, type: 'cosmetic', rarity, name: pick.name, cost, kind: pick.kind };
};

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

const buildSeason = (): BattlePassSeason => ({
  id: 'temporada-01',
  name: 'Temporada 1 · Ascenso Toonix',
  subtitle: 'Gasta tus puntos en los cosméticos que quieras',
  startDate: '2026-11-01T00:00:00',
  endDate: '2026-12-31T23:59:59',
  pages: buildPages(),
});

// Estado mutable (una sola instancia para toda la app)
let season: BattlePassSeason = buildSeason();

export const battlePassStore = {
  /** Referencia viva (solo lectura desde la vista de usuario). */
  getSeason(): BattlePassSeason {
    return season;
  },

  /** Copia profunda para estado local de la administración. */
  cloneSeason(): BattlePassSeason {
    return structuredClone(season);
  },

  /** Editar metadatos de la temporada. */
  updateSeason(patch: Partial<Pick<BattlePassSeason, 'name' | 'subtitle' | 'startDate' | 'endDate'>>): void {
    Object.assign(season, patch);
  },

  /** Restaurar los datos por defecto (demo). */
  reset(): void {
    season = buildSeason();
  },

  /** Añadir página al final. Devuelve su id. */
  addPage(): number {
    const id = Math.max(0, ...season.pages.map((p) => p.id)) + 1;
    // La que era última pasa a necesitar puntos para abrir la nueva
    const prevLast = season.pages[season.pages.length - 1];
    if (prevLast && prevLast.pointsToUnlockNext === 0) {
      prevLast.pointsToUnlockNext = POINTS_TO_UNLOCK_NEXT;
    }
    season.pages.push({
      id,
      title: `Página ${id}`,
      subtitle: 'Describe el tema de esta página',
      pointsToUnlockNext: 0, // es la última
      rewards: [],
    });
    return id;
  },

  updatePage(id: number, patch: Partial<Pick<BattlePassPage, 'title' | 'subtitle' | 'pointsToUnlockNext'>>): void {
    const page = season.pages.find((p) => p.id === id);
    if (!page) throw new Error('Página no encontrada');
    Object.assign(page, patch);
  },

  /** Eliminar página (mínimo 1). La nueva última deja de exigir puntos. */
  deletePage(id: number): void {
    if (season.pages.length <= 1) throw new Error('La temporada debe tener al menos una página');
    season.pages = season.pages.filter((p) => p.id !== id);
    const last = season.pages[season.pages.length - 1];
    if (last) last.pointsToUnlockNext = 0;
  },

  /** Añadir recompensa a una página. Devuelve su id. */
  addReward(pageId: number, data: Omit<BattlePassReward, 'id'>): string {
    const page = season.pages.find((p) => p.id === pageId);
    if (!page) throw new Error('Página no encontrada');
    const used = page.rewards.map((r) => Number(r.id.split('-s')[1]) || 0);
    const id = `p${pageId}-s${Math.max(-1, ...used) + 1}`;
    page.rewards.push({ ...data, id });
    return id;
  },

  updateReward(rewardId: string, patch: Partial<Omit<BattlePassReward, 'id'>>): void {
    for (const page of season.pages) {
      const reward = page.rewards.find((r) => r.id === rewardId);
      if (reward) {
        Object.assign(reward, patch);
        return;
      }
    }
    throw new Error('Recompensa no encontrada');
  },

  deleteReward(pageId: number, rewardId: string): void {
    const page = season.pages.find((p) => p.id === pageId);
    if (!page) throw new Error('Página no encontrada');
    page.rewards = page.rewards.filter((r) => r.id !== rewardId);
  },
};

/** Días restantes de la temporada actual (nunca negativo). */
export const getDaysRemaining = (): number => {
  const diff = new Date(season.endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
};
