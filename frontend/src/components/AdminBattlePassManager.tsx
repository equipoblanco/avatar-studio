import React, { useEffect, useState } from 'react';
import {
  BattlePassPage as PageModel,
  BattlePassReward,
  RewardRarity,
  RewardType,
} from '../types/battlePass';
import { battlePassStore, COST_BY_RARITY, POINTS_TO_UNLOCK_NEXT } from '../services/battlePassMock';

/**
 * ==========================================================================================
 * GESTOR ADMINISTRATIVO DEL PASE DE BATALLA
 * ==========================================================================================
 * - Editar metadatos de la temporada (nombre, fechas).
 * - Crear / editar / eliminar páginas (con su requisito de puntos).
 * - Crear / editar / eliminar recompensas dentro de la cuadrícula de cada página.
 * - Opera sobre el store mock compartido con la vista de usuario (sin backend aún).
 */

const RARITY_OPTIONS: { value: RewardRarity; label: string; badge: string; border: string }[] = [
  { value: 'common', label: 'Común', badge: 'bg-stone-100 text-stone-600 border-stone-300', border: 'border-stone-300' },
  { value: 'rare', label: 'Raro', badge: 'bg-blue-50 text-blue-600 border-blue-300', border: 'border-blue-400' },
  { value: 'epic', label: 'Épico', badge: 'bg-violet-50 text-violet-600 border-violet-300', border: 'border-violet-400' },
  { value: 'legendary', label: 'Legendario', badge: 'bg-amber-50 text-amber-700 border-[#FACC15]', border: 'border-[#FACC15]' },
];

const rarityBadge = (r: RewardRarity) => RARITY_OPTIONS.find((o) => o.value === r)?.badge || '';

const RARITY_LABELS: Record<RewardRarity, string> = {
  common: 'Común',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Legendario',
};

interface AdminBattlePassManagerProps {
  /** Salta a la vista de usuario para previsualizar. */
  onPreview?: () => void;
}

export const AdminBattlePassManager: React.FC<AdminBattlePassManagerProps> = ({ onPreview }) => {
  const [season, setSeason] = useState(() => battlePassStore.cloneSeason());
  const [activePageId, setActivePageId] = useState<number>(season.pages[0]?.id ?? 0);

  // Formulario de temporada (se sincroniza con el store al refrescar)
  const [formName, setFormName] = useState(season.name);
  const [formSubtitle, setFormSubtitle] = useState(season.subtitle);
  const [formStart, setFormStart] = useState(season.startDate.slice(0, 10));
  const [formEnd, setFormEnd] = useState(season.endDate.slice(0, 10));

  // Modal de recompensa
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<string | null>(null);
  const [formType, setFormType] = useState<RewardType>('cosmetic');
  const [formRarity, setFormRarity] = useState<RewardRarity>('common');
  const [formRewardName, setFormRewardName] = useState('');
  const [formKind, setFormKind] = useState('');
  const [formQuantity, setFormQuantity] = useState(100);
  const [formCost, setFormCost] = useState(COST_BY_RARITY.common);

  const refresh = () => {
    const next = battlePassStore.cloneSeason();
    setSeason(next);
    setFormName(next.name);
    setFormSubtitle(next.subtitle);
    setFormStart(next.startDate.slice(0, 10));
    setFormEnd(next.endDate.slice(0, 10));
    if (!next.pages.some((p) => p.id === activePageId)) {
      setActivePageId(next.pages[0]?.id ?? 0);
    }
  };

  const activePage: PageModel | undefined =
    season.pages.find((p) => p.id === activePageId) || season.pages[0];
  const isLastPage = activePage ? activePage.id === season.pages[season.pages.length - 1].id : false;

  const totalRewards = season.pages.reduce((sum, p) => sum + p.rewards.length, 0);
  const totalCost = season.pages.reduce(
    (sum, p) => sum + p.rewards.reduce((s, r) => s + r.cost, 0),
    0,
  );

  // ---------------------------------------------------------------------------------------
  // TEMPORADA
  // ---------------------------------------------------------------------------------------
  const handleSaveSeason = () => {
    battlePassStore.updateSeason({
      name: formName.trim() || 'Temporada sin nombre',
      subtitle: formSubtitle.trim(),
      startDate: formStart,
      endDate: formEnd,
    });
    refresh();
  };

  // ---------------------------------------------------------------------------------------
  // PÁGINAS
  // ---------------------------------------------------------------------------------------
  const handleAddPage = () => {
    const id = battlePassStore.addPage();
    refresh();
    setActivePageId(id);
  };

  const handleDeletePage = () => {
    if (!activePage) return;
    if (
      !window.confirm(
        `¿Eliminar la página "${activePage.title}" con sus ${activePage.rewards.length} recompensas? Esta acción no se puede deshacer.`,
      )
    )
      return;
    battlePassStore.deletePage(activePage.id);
    refresh();
  };

  const handlePageField = (field: 'title' | 'subtitle' | 'pointsToUnlockNext', value: string | number) => {
    if (!activePage) return;
    battlePassStore.updatePage(activePage.id, { [field]: value } as any);
    // Solo refrescar la copia local sin tocar el formulario de temporada
    const next = battlePassStore.cloneSeason();
    setSeason(next);
  };

  // ---------------------------------------------------------------------------------------
  // RECOMPENSAS
  // ---------------------------------------------------------------------------------------
  const openCreateReward = () => {
    setEditingRewardId(null);
    setFormType('cosmetic');
    setFormRarity('common');
    setFormRewardName('');
    setFormKind('');
    setFormQuantity(100);
    setFormCost(COST_BY_RARITY.common);
    setIsRewardModalOpen(true);
  };

  const openEditReward = (reward: BattlePassReward) => {
    setEditingRewardId(reward.id);
    setFormType(reward.type);
    setFormRarity(reward.rarity);
    setFormRewardName(reward.name);
    setFormKind(reward.kind || '');
    setFormQuantity(reward.quantity || 100);
    setFormCost(reward.cost);
    setIsRewardModalOpen(true);
  };

  const handleRarityChange = (rarity: RewardRarity) => {
    setFormRarity(rarity);
    setFormCost(COST_BY_RARITY[rarity]); // coste sugerido por rareza
  };

  const handleSaveReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePage) return;
    if (!formRewardName.trim()) {
      alert('Escribe un nombre para la recompensa.');
      return;
    }

    const data = {
      type: formType,
      rarity: formRarity,
      name: formRewardName.trim(),
      cost: Math.max(1, Number(formCost) || 1),
      kind: formType === 'cosmetic' ? formKind.trim() || undefined : undefined,
      quantity: formType === 'currency' ? Math.max(1, Number(formQuantity) || 1) : undefined,
    };

    if (editingRewardId) {
      battlePassStore.updateReward(editingRewardId, data);
    } else {
      battlePassStore.addReward(activePage.id, data);
    }
    refresh();
    setIsRewardModalOpen(false);
  };

  const handleDeleteReward = (reward: BattlePassReward) => {
    if (!activePage) return;
    if (!window.confirm(`¿Eliminar la recompensa "${reward.name}"?`)) return;
    battlePassStore.deleteReward(activePage.id, reward.id);
    refresh();
  };

  // Sincroniza el formulario de temporada cuando cambia el store
  useEffect(() => {
    setFormName(season.name);
    setFormSubtitle(season.subtitle);
    setFormStart(season.startDate.slice(0, 10));
    setFormEnd(season.endDate.slice(0, 10));
  }, [season]);

  const inputCls =
    'w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#7446E8]';

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ------------------------------------------------------------------ CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
            ADMINISTRACIÓN / PASE DE BATALLA
          </span>
          <h1 className="text-3xl font-black text-[#252137] tracking-tight">Diseña la temporada.</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Temporada, páginas y recompensas. Los cambios se ven al instante en la vista de usuario.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm('¿Restablecer el pase de batalla a los datos por defecto?')) {
                battlePassStore.reset();
                refresh();
                setActivePageId(battlePassStore.getSeason().pages[0]?.id ?? 0);
              }
            }}
            className="border border-[#E5E3ED] bg-white text-stone-600 hover:bg-stone-50 font-bold rounded-xl px-4 py-2.5 text-xs shadow-2xs transition-all"
          >
            ↺ Restablecer
          </button>
          {onPreview && (
            <button
              onClick={onPreview}
              className="border border-[#E5E3ED] bg-white text-[#252137] hover:bg-stone-50 font-bold rounded-xl px-5 py-2.5 text-xs flex items-center gap-2 shadow-2xs transition-all"
            >
              <span>↗</span>
              <span>Ver como usuario</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ KPIS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#EBF8FF] border border-[#BEE3F8] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="text-2xl font-black text-[#2B6CB0]">{season.pages.length}</div>
          <div className="text-xs font-bold text-[#2B6CB0]">páginas de temporada</div>
        </div>
        <div className="bg-[#FAF5FF] border border-[#E9D8FD] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="text-2xl font-black text-[#6B46C1]">{totalRewards}</div>
          <div className="text-xs font-bold text-[#6B46C1]">recompensas publicadas</div>
        </div>
        <div className="bg-[#FEFCBF] border border-[#FAF089] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="text-2xl font-black text-[#975A16]">{POINTS_TO_UNLOCK_NEXT}</div>
          <div className="text-xs font-bold text-[#975A16]">pts para abrir la siguiente</div>
        </div>
        <div className="bg-[#E6F4EA] border border-[#B7E1C5] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="text-2xl font-black text-[#137333]">{totalCost}</div>
          <div className="text-xs font-bold text-[#137333]">pts en recompensas (valor total)</div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ TEMPORADA */}
      <div className="bg-white border border-[#E5E3ED] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-base">⭐</span>
          <h2 className="text-base font-black text-[#252137]">Temporada</h2>
          <span className="text-[10px] font-mono text-stone-400">{season.id}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-700 font-bold mb-1 text-xs">Nombre</label>
            <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-stone-700 font-bold mb-1 text-xs">Subtítulo</label>
            <input
              type="text"
              value={formSubtitle}
              onChange={(e) => setFormSubtitle(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-bold mb-1 text-xs">Fecha de inicio</label>
            <input
              type="date"
              value={formStart}
              onChange={(e) => setFormStart(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-stone-700 font-bold mb-1 text-xs">Fecha de fin</label>
            <input type="date" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSaveSeason}
            className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-md shadow-[#7446E8]/30 transition-all active:scale-95"
          >
            ✓ Guardar temporada
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------------ PÁGINAS */}
      <div className="bg-white border border-[#E5E3ED] rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base">📄</span>
            <h2 className="text-base font-black text-[#252137]">Páginas</h2>
            <span className="bg-[#EEE7FF] text-[#7446E8] font-bold text-[10px] px-2.5 py-0.5 rounded-full">
              {season.pages.length} páginas
            </span>
          </div>
          <button
            onClick={handleAddPage}
            className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md shadow-[#7446E8]/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <span>+</span>
            <span>Nueva página</span>
          </button>
        </div>

        {/* Chips de navegación de páginas */}
        <div className="flex flex-wrap items-center gap-2">
          {season.pages.map((page, i) => (
            <button
              key={page.id}
              onClick={() => setActivePageId(page.id)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg border transition-all ${
                page.id === activePage?.id
                  ? 'bg-[#252137] text-white border-[#252137]'
                  : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-50'
              }`}
            >
              Pág. {i + 1} · {page.title}
              {i === season.pages.length - 1 && (
                <span className={page.id === activePage?.id ? ' text-[#FACC15]' : ' text-amber-500'}> ★</span>
              )}
            </button>
          ))}
        </div>

        {/* Detalle de la página activa */}
        {activePage && (
          <div className="border-t border-[#E5E3ED] pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-stone-700 font-bold mb-1 text-xs">Título</label>
                <input
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handlePageField('title', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1 text-xs">Subtítulo</label>
                <input
                  type="text"
                  value={activePage.subtitle}
                  onChange={(e) => handlePageField('subtitle', e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-stone-700 font-bold mb-1 text-xs">
                  Puntos para abrir la siguiente página
                </label>
                <input
                  type="number"
                  min={0}
                  disabled={isLastPage}
                  value={activePage.pointsToUnlockNext}
                  onChange={(e) => handlePageField('pointsToUnlockNext', Math.max(0, Number(e.target.value) || 0))}
                  className={`${inputCls} disabled:bg-stone-100 disabled:text-stone-400`}
                />
                {isLastPage && <span className="text-[10px] text-stone-400">Última página: no aplica</span>}
              </div>
            </div>

            {/* Recompensas de la página */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-[#252137]">Recompensas</h3>
                <span className="text-[11px] text-stone-500">
                  {activePage.rewards.length} items · valor {activePage.rewards.reduce((s, r) => s + r.cost, 0)} pts
                </span>
              </div>
              <button
                onClick={openCreateReward}
                className="bg-[#EEE7FF] hover:bg-[#E4DBFF] text-[#7446E8] font-bold rounded-xl px-4 py-2 text-xs flex items-center gap-1.5 transition-all border border-[#DEDCE7]"
              >
                <span>+</span>
                <span>Nueva recompensa</span>
              </button>
            </div>

            {activePage.rewards.length === 0 ? (
              <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center text-xs text-stone-500">
                Esta página aún no tiene recompensas. Añade al menos una para que los jugadores tengan qué desbloquear.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {activePage.rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`relative rounded-xl border-2 bg-white p-3 flex flex-col items-center text-center min-h-[150px] ${
                      RARITY_OPTIONS.find((o) => o.value === reward.rarity)?.border || 'border-stone-300'
                    }`}
                    title={`${reward.name} — ${RARITY_LABELS[reward.rarity]} — ${reward.cost} pts`}
                  >
                    {/* Acciones */}
                    <div className="absolute top-1.5 right-1.5 flex gap-1">
                      <button
                        onClick={() => openEditReward(reward)}
                        className="w-6 h-6 rounded-md bg-stone-100 hover:bg-[#EEE7FF] text-stone-500 hover:text-[#7446E8] text-[10px] flex items-center justify-center transition-all"
                        title="Editar recompensa"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward)}
                        className="w-6 h-6 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-500 text-[10px] flex items-center justify-center transition-all"
                        title="Eliminar recompensa"
                      >
                        🗑
                      </button>
                    </div>

                    {/* Icono de tipo */}
                    <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-center text-lg mt-2">
                      {reward.type === 'currency' ? '🪙' : '👕'}
                    </div>

                    <span className="mt-1.5 text-[11px] font-bold leading-tight text-[#252137] line-clamp-2 break-words">
                      {reward.name}
                    </span>

                    <span
                      className={`text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded border mt-1 ${rarityBadge(
                        reward.rarity,
                      )}`}
                    >
                      {RARITY_LABELS[reward.rarity]}
                    </span>

                    <span className="text-[10px] font-black text-stone-500 mt-auto pt-1.5">
                      {reward.cost} PTS
                      {reward.type === 'currency' && reward.quantity ? ` · ×${reward.quantity}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Eliminar página */}
            <div className="flex justify-end pt-2 border-t border-[#E5E3ED]/60">
              <button
                onClick={handleDeletePage}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-700 hover:underline transition-colors"
              >
                🗑 Eliminar esta página
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ MODAL DE RECOMPENSA */}
      {isRewardModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-[#252137] max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-[#252137]">
              {editingRewardId ? 'Editar recompensa' : 'Nueva recompensa'}
            </h3>
            <p className="text-xs text-stone-500">
              Se añadirá a la página «{activePage?.title}» {editingRewardId ? '' : '(al final de la cuadrícula)'}.
            </p>

            <form onSubmit={handleSaveReward} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as RewardType)}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="cosmetic">Cosmético</option>
                    <option value="currency">Monedas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Rareza (sugiere coste)</label>
                  <select
                    value={formRarity}
                    onChange={(e) => handleRarityChange(e.target.value as RewardRarity)}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                  >
                    {RARITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label} ({COST_BY_RARITY[o.value]} pts)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={formRewardName}
                  onChange={(e) => setFormRewardName(e.target.value)}
                  placeholder={formType === 'currency' ? 'Monedas Toonix' : 'Cabello Galaxy'}
                  className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {formType === 'cosmetic' ? (
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Categoría</label>
                    <input
                      type="text"
                      value={formKind}
                      onChange={(e) => setFormKind(e.target.value)}
                      placeholder="Cabello, Accesorio..."
                      className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Cantidad</label>
                    <input
                      type="number"
                      min={1}
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(Number(e.target.value))}
                      className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Coste en puntos</label>
                  <input
                    type="number"
                    min={1}
                    value={formCost}
                    onChange={(e) => setFormCost(Number(e.target.value))}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="bg-[#FEF9E7] border border-[#FDE68A] text-[#8C6D1F] p-3 rounded-xl text-[11px] leading-relaxed">
                ⓘ El coste se aplica en la vista de usuario: el jugador gasta puntos para desbloquearla.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRewardModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#7446E8] text-white font-bold rounded-xl px-5 py-2 text-xs shadow-md"
                >
                  {editingRewardId ? 'Guardar cambios' : 'Crear recompensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
