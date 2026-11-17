/**
 * ==========================================================================================
 * TIPOS DEL PASE DE BATALLA (Battle Pass)
 * ==========================================================================================
 * Modelo estilo Helldivers 2 (Warbond):
 * - La temporada se divide en PÁGINAS apiladas en vertical (scroll hacia abajo).
 * - Cada página es una cuadrícula de recompensas con COSTE en puntos.
 * - El jugador ELIGE qué desbloquear gastando sus puntos (sin orden fijo).
 * - Para pasar a la página siguiente hay que haber gastado X puntos en la actual.
 * - Sin carril premium: una sola vía gratuita.
 */

/** Rareza visual de la recompensa (define colores de borde e icono). */
export type RewardRarity = 'common' | 'rare' | 'epic' | 'legendary';

/** Tipo de recompensa entregada. */
export type RewardType = 'cosmetic' | 'currency';

/** Recompensa individual de una página. */
export interface BattlePassReward {
  /** Identificador único: `p{pagina}-s{slot}` */
  id: string;
  type: RewardType;
  rarity: RewardRarity;
  /** Nombre del cosmético/objeto (placeholder hasta conectar el backend). */
  name: string;
  /** Coste en puntos para desbloquearla. */
  cost: number;
  /** Cantidad solo aplica para `currency`. */
  quantity?: number;
  /** Categoría del cosmético (Cabello, Accesorio, ...). Solo informativo. */
  kind?: string;
}

/** Página del pase: cuadrícula de recompensas + requisito para abrir la siguiente. */
export interface BattlePassPage {
  id: number;
  title: string;
  subtitle: string;
  /**
   * Puntos que hay que gastar en ESTA página para desbloquear la siguiente.
   * 0 en la última página.
   */
  pointsToUnlockNext: number;
  rewards: BattlePassReward[];
}

/** Metadatos de la temporada actual. */
export interface BattlePassSeason {
  id: string;
  name: string;
  subtitle: string;
  /** ISO date */
  startDate: string;
  /** ISO date — se usa para calcular los días restantes. */
  endDate: string;
  pages: BattlePassPage[];
}
