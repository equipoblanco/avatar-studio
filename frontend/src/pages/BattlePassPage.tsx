import React, { useMemo, useRef, useState } from 'react';
import { BattlePassPage as PageModel, BattlePassReward, RewardRarity } from '../types/battlePass';
import { battlePassStore, STARTING_POINTS, getDaysRemaining } from '../services/battlePassMock';

/**
 * ==========================================================================================
 * PASE DE BATALLA — estilo Helldivers 2 (Warbond)
 * ==========================================================================================
 * - Páginas apiladas en VERTICAL (scroll hacia abajo), sin riel horizontal.
 * - El jugador ELIGE qué desbloquear gastando puntos en una cuadrícula de items.
 * - Para abrir la siguiente página hay que gastar X puntos en la anterior.
 * - Solo vía gratis (sin premium). Datos 100% mock.
 */

// ---------------------------------------------------------------------------------------------
// ESTILOS DE RAREZA
// ---------------------------------------------------------------------------------------------
const RARITY_STYLES: Record<RewardRarity, { border: string; icon: string; label: string; chip: string }> = {
  common: { border: 'border-stone-300', icon: 'text-stone-500', label: 'text-stone-400', chip: 'bg-stone-100' },
  rare: { border: 'border-blue-400', icon: 'text-blue-500', label: 'text-blue-500', chip: 'bg-blue-50' },
  epic: { border: 'border-violet-400', icon: 'text-violet-500', label: 'text-violet-500', chip: 'bg-violet-50' },
  legendary: { border: 'border-[#FACC15]', icon: 'text-amber-500', label: 'text-amber-600', chip: 'bg-amber-50' },
};

const RARITY_LABELS: Record<RewardRarity, string> = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

// ---------------------------------------------------------------------------------------------
// ICONOS SVG (línea, mismo estilo que el resto de la app)
// ---------------------------------------------------------------------------------------------
const IconShirt = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 4 12 6l3-2 5 3-1.5 4L16 9.5V20H8V9.5L6.5 11 5 7z" />
  </svg>
);
const IconCoin = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.5v9M14.8 9.8c-.5-.8-1.5-1.2-2.8-1.2-1.6 0-2.7.8-2.7 2s1 1.7 2.7 2.1c1.7.4 2.8.9 2.8 2.1s-1.2 2-2.8 2c-1.3 0-2.4-.4-2.9-1.3" />
  </svg>
);
const IconLock = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
    <path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5 10 17.5 19 7" />
  </svg>
);

const rewardIcon = (type: BattlePassReward['type']) =>
  type === 'currency' ? <IconCoin /> : <IconShirt />;

// ---------------------------------------------------------------------------------------------
// TARJETA DE RECOMPENSA
// ---------------------------------------------------------------------------------------------
const RewardCard: React.FC<{
  reward: BattlePassReward;
  owned: boolean;
  canAfford: boolean;
  pageLocked: boolean;
  onUnlock: () => void;
}> = ({ reward, owned, canAfford, pageLocked, onUnlock }) => {
  const rarity = RARITY_STYLES[reward.rarity];

  const border = owned ? 'border-emerald-400 bg-emerald-50/40' : `${rarity.border} bg-white`;

  return (
    <div
      className={`relative rounded-xl border-2 ${border} p-3 flex flex-col items-center text-center min-h-[178px] transition-all`}
      title={`${reward.name} — ${RARITY_LABELS[reward.rarity]} — ${reward.cost} puntos`}
    >
      {/* Check de obtenida */}
      {owned && (
        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-emerald-500 text-white border-2 border-white flex items-center justify-center shadow-xs">
          <IconCheck />
        </span>
      )}

      {/* Icono */}
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center ${owned ? 'bg-emerald-50 text-emerald-600' : `${rarity.chip} ${rarity.icon}`}`}
      >
        {rewardIcon(reward.type)}
      </div>

      {/* Nombre */}
      <span className="mt-2 text-[11px] font-bold leading-tight text-[#252137] line-clamp-2 break-words">
        {reward.name}
      </span>

      {/* Rareza / tipo */}
      <span className={`text-[8px] font-black uppercase tracking-wide ${owned ? 'text-emerald-600' : rarity.label}`}>
        {RARITY_LABELS[reward.rarity]}
        {reward.type === 'currency' && reward.quantity ? ` · ×${reward.quantity}` : ''}
      </span>
      {reward.kind && (
        <span className="text-[8px] text-stone-400 mt-0.5">{reward.kind}</span>
      )}

      {/* Acción */}
      <div className="mt-auto pt-2 w-full">
        {owned ? (
          <div className="w-full bg-emerald-100 border border-emerald-300 text-emerald-700 text-[10px] font-black py-1.5 rounded-lg text-center">
            OBTENIDO
          </div>
        ) : (
          <button
            onClick={onUnlock}
            disabled={!canAfford || pageLocked}
            className={`w-full text-[10px] font-black py-1.5 rounded-lg border transition-all active:scale-95
              ${canAfford && !pageLocked
                ? 'bg-[#FACC15] border-[#252137] text-[#252137] hover:brightness-95 shadow-xs'
                : 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            title={canAfford ? `Desbloquear por ${reward.cost} puntos` : `Te faltan ${reward.cost} puntos`}
          >
            {reward.cost} PTS
          </button>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------
// PÁGINA DEL PASE DE BATALLA
// ---------------------------------------------------------------------------------------------
export const BattlePassPage: React.FC = () => {
  // La temporada se lee del store compartido (la admin puede editarla)
  const season = battlePassStore.getSeason();
  const pages = season.pages;
  const daysLeft = useMemo(() => getDaysRemaining(), []);

  // Estado mock del jugador
  const [points, setPoints] = useState(STARTING_POINTS);
  const [owned, setOwned] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  /** Puntos gastados en una página concreta. */
  const spentOn = (page: PageModel): number =>
    page.rewards.reduce((sum, r) => (owned.has(r.id) ? sum + r.cost : sum), 0);

  /** ¿La página está desbloqueada? (la primera siempre; el resto requiere gastar X en la anterior) */
  const isUnlocked = (idx: number): boolean => {
    if (idx === 0) return true;
    const prev = pages[idx - 1];
    return isUnlocked(idx - 1) && spentOn(prev) >= prev.pointsToUnlockNext;
  };

  /** Desbloquea una recompensa gastando puntos. */
  const unlock = (reward: BattlePassReward) => {
    if (owned.has(reward.id) || points < reward.cost) return;
    setOwned((prev) => {
      const next = new Set(prev);
      next.add(reward.id);
      return next;
    });
    setPoints((p) => p - reward.cost);
  };

  /** Reinicia la demo. */
  const reset = () => {
    setPoints(STARTING_POINTS);
    setOwned(new Set());
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /** Añade puntos (demo). */
  const gainPoints = (amount: number) => setPoints((p) => p + amount);

  /** Scroll suave a una página. */
  const goToPage = (idx: number) => {
    const el = sectionRefs.current[idx];
    const container = scrollRef.current;
    if (!el || !container) return;
    container.scrollTo({ top: el.offsetTop - 8, behavior: 'smooth' });
  };

  const totalSpent = pages.reduce((sum, p) => sum + spentOn(p), 0);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#FAF9FD] text-[#252137]">
      {/* ------------------------------------------------------------------ HEADER FIJO */}
      <div className="shrink-0 bg-white border-b border-[#E5E3ED] px-6 py-4 space-y-3">
        {/* Fila 1: identidad + puntos + acciones */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#FACC15] border-2 border-[#252137] flex items-center justify-center shadow-xs">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#252137]" fill="currentColor">
                <path d="M12 3l2.6 5.6 6 .7-4.4 4.1 1.2 6L12 16.5 6.6 19.4l1.2-6L3.4 9.3l6-.7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight">{season.name}</h1>
              <p className="text-xs text-stone-500">{season.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Cuenta regresiva */}
            <span className="text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg">
              ⏳ {daysLeft} días restantes
            </span>

            {/* Gastado */}
            <span className="text-[11px] font-bold text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg tabular-nums">
              Gastado: {totalSpent} pts
            </span>

            {/* Saldo de puntos */}
            <span className="flex items-center gap-2 bg-[#252137] text-white text-sm font-black px-4 py-1.5 rounded-lg border-2 border-[#FACC15] shadow-xs tabular-nums">
              <span className="w-4 h-4 rounded-full bg-[#FACC15] text-[#252137] flex items-center justify-center text-[9px] font-black">
                P
              </span>
              {points} PTS
            </span>

            {/* Ganar puntos (demo) */}
            <button
              onClick={() => gainPoints(50)}
              className="text-[11px] font-black text-[#252137] bg-[#FACC15] border-2 border-[#252137] px-3 py-1.5 rounded-lg hover:brightness-95 active:scale-95 transition-all shadow-xs"
              title="Simula 50 puntos de demostración"
            >
              +50 PTS (demo)
            </button>

            {/* Reiniciar demo */}
            <button
              onClick={reset}
              className="text-[11px] font-bold text-stone-500 bg-white border border-stone-300 px-3 py-1.5 rounded-lg hover:bg-stone-50 active:scale-95 transition-all"
            >
              Reiniciar
            </button>
          </div>
        </div>

        {/* Fila 2: navegación entre páginas (scroll vertical) */}
        <div className="flex items-center gap-2 flex-wrap">
          {pages.map((page, i) => {
            const unlocked = isUnlocked(i);
            return (
              <button
                key={page.id}
                onClick={() => unlocked && goToPage(i)}
                disabled={!unlocked}
                className={`flex items-center gap-1.5 text-[11px] font-black px-3 py-1.5 rounded-lg border transition-all ${
                  unlocked
                    ? 'bg-white border-stone-300 text-[#252137] hover:bg-stone-50'
                    : 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                title={unlocked ? `Ir a la página ${i + 1}` : 'Página bloqueada'}
              >
                {!unlocked && <IconLock className="w-3 h-3" />}
                Pág. {i + 1} · {page.title}
              </button>
            );
          })}

          <span className="text-[10px] text-stone-400 ml-auto">
            Gasta puntos en lo que quieras · la siguiente página se abre al gastar {pages[0].pointsToUnlockNext} pts en la anterior
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ PÁGINAS EN VERTICAL */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
        <div className="space-y-8 max-w-6xl mx-auto">
          {pages.map((page, pageIdx) => {
            const unlocked = isUnlocked(pageIdx);
            const spent = spentOn(page);
            const isLast = pageIdx === pages.length - 1;
            const prev = pageIdx > 0 ? pages[pageIdx - 1] : null;
            const prevSpent = prev ? spentOn(prev) : 0;
            const progressPct = page.pointsToUnlockNext > 0
              ? Math.min(100, Math.round((spent / page.pointsToUnlockNext) * 100))
              : 100;

            return (
              <section
                key={page.id}
                ref={(el) => {
                  sectionRefs.current[pageIdx] = el;
                }}
              >
                {/* Cabecera de página */}
                <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white border-2 border-[#252137] font-black text-lg flex items-center justify-center shadow-xs shrink-0">
                      {pageIdx + 1}
                    </div>
                    <div>
                      <h2 className="font-black text-base leading-tight">
                        Página {pageIdx + 1} · {page.title}
                      </h2>
                      <p className="text-xs text-stone-500">{page.subtitle}</p>
                    </div>
                  </div>

                  {/* Requisito de la siguiente página / estado */}
                  {isLast ? (
                    <span className="text-[11px] font-black text-[#252137] bg-[#FACC15]/30 border border-[#FACC15] px-3 py-1.5 rounded-lg">
                      ★ Última página de la temporada
                    </span>
                  ) : unlocked ? (
                    <div className="min-w-[240px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-black text-stone-500 uppercase tracking-wide">
                          Pág. {pageIdx + 2} desbloquea al gastar
                        </span>
                        <span className="text-[11px] font-black tabular-nums text-[#252137]">
                          {spent}/{page.pointsToUnlockNext} PTS
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-stone-200 border border-stone-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FACC15] to-amber-500 transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-black text-stone-500 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg">
                      <IconLock className="w-3.5 h-3.5" />
                      Requiere {page.pointsToUnlockNext} PTS gastados en Pág. {pageIdx} ({prevSpent}/{page.pointsToUnlockNext})
                    </span>
                  )}
                </div>

                {/* Cuadrícula de recompensas */}
                <div className="relative">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {page.rewards.map((reward) => (
                      <RewardCard
                        key={reward.id}
                        reward={reward}
                        owned={owned.has(reward.id)}
                        canAfford={points >= reward.cost}
                        pageLocked={!unlocked}
                        onUnlock={() => unlock(reward)}
                      />
                    ))}
                  </div>

                  {/* Overlay de página bloqueada */}
                  {!unlocked && (
                    <div className="absolute inset-0 z-10 rounded-2xl bg-[#FAF9FD]/88 backdrop-blur-[2px] border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-2 px-4 text-center">
                      <span className="text-stone-400">
                        <IconLock className="w-8 h-8" />
                      </span>
                      <span className="font-black text-sm text-stone-600">
                        Página {pageIdx + 1} bloqueada
                      </span>
                      <span className="text-[11px] text-stone-500 max-w-sm">
                        Gasta <b className="text-[#252137]">{page.pointsToUnlockNext} puntos</b> en la página anterior
                        (vas por <b className="text-[#252137]">{prevSpent}</b>) para abrirla.
                      </span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}

          <p className="text-center text-[10px] text-stone-400 pb-4">
            Datos de demostración (mock) — las recompensas se conectarán al catálogo real cuando el backend esté listo.
          </p>
        </div>
      </div>
    </div>
  );
};
