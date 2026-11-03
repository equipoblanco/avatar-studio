import React, { useState, useEffect } from 'react';
import { Category, CatalogAsset } from '../types/catalog';
import { IncompatibilityRule } from '../types/incompatibility';
import { catalogApi } from '../services/catalogApi';

interface EditorCatalogPanelProps {
  categories: Category[];
  currentCategoryCode?: string;
  onSelectCategoryCode?: (code: string) => void;
  equippedAssets: Record<string, CatalogAsset | null>;
  incompatibilityRules?: IncompatibilityRule[];
  onEquipAsset: (categoryCode: string, asset: CatalogAsset) => void;
  onUnequipAsset?: (categoryCode: string) => void;
  userId?: number;
}

interface ActiveConflict {
  candidateAsset: CatalogAsset;
  equippedAsset: CatalogAsset;
  rule: IncompatibilityRule;
}

export const EditorCatalogPanel: React.FC<EditorCatalogPanelProps> = ({
  categories,
  currentCategoryCode = 'peinado',
  equippedAssets,
  incompatibilityRules = [],
  onEquipAsset,
  onUnequipAsset,
  userId = 1,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assets, setAssets] = useState<CatalogAsset[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Alerta modal por incompatibilidad de capas cruzadas
  const [activeConflict, setActiveConflict] = useState<ActiveConflict | null>(null);

  const activeCategory = categories.find((c) => c.code === currentCategoryCode);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await catalogApi.getCatalogAssets({
        categoryCode: currentCategoryCode,
        query: searchQuery,
        userId: userId,
        availableOnly: true,
      });

      // Filtrar activos vacíos redundantes
      const validAssets = data.filter(
        (a) =>
          a.spriteUrl &&
          !a.tags?.includes('vacio') &&
          a.name !== 'Torso Básico Neutro' &&
          a.name !== 'Sin Accesorio' &&
          a.name !== 'Cabeza Rapada / Lisa'
      );
      setAssets(validAssets);
    } catch (err: any) {
      setError(err.message || 'Error al cargar catálogo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [currentCategoryCode, searchQuery, userId]);

  const checkConflict = (candidate: CatalogAsset): ActiveConflict | null => {
    for (const [slotCode, equipped] of Object.entries(equippedAssets)) {
      if (!equipped || slotCode === candidate.categoryCode) continue;

      const matchingRule = incompatibilityRules.find((rule) => {
        return (
          (rule.assetAId === candidate.id && rule.assetBId === equipped.id) ||
          (rule.assetAId === equipped.id && rule.assetBId === candidate.id)
        );
      });

      if (matchingRule) {
        return {
          candidateAsset: candidate,
          equippedAsset: equipped,
          rule: matchingRule,
        };
      }
    }
    return null;
  };

  const handleSelectAsset = (asset: CatalogAsset) => {
    const conflict = checkConflict(asset);

    if (conflict) {
      setActiveConflict(conflict);
      return;
    }

    onEquipAsset(asset.categoryCode, asset);
  };

  const handleResolveConflictAndEquip = () => {
    if (!activeConflict) return;
    if (onUnequipAsset) {
      onUnequipAsset(activeConflict.equippedAsset.categoryCode);
    }
    onEquipAsset(activeConflict.candidateAsset.categoryCode, activeConflict.candidateAsset);
    setActiveConflict(null);
  };

  const equippedInCurrentSlot = equippedAssets[currentCategoryCode];

  return (
    <div className="w-full flex flex-col h-full space-y-4">
      {/* Buscador de la categoría */}
      <div className="relative">
        <input
          type="text"
          placeholder={`Buscar en ${activeCategory?.name.toLowerCase() || 'piezas'}... /`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#FBFBFE] border border-[#E5E3ED] rounded-xl pl-9 pr-8 py-2.5 text-xs text-stone-700 placeholder-stone-400 outline-none focus:border-[#7446E8]"
        />
        <span className="absolute left-3 top-3 text-stone-400 text-xs">🔍</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs rounded-2xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 text-stone-500 text-xs space-y-2">
          <div className="w-7 h-7 border-3 border-[#7446E8] border-t-transparent rounded-full animate-spin" />
          <span className="font-bold">Cargando piezas...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-center p-6 bg-[#FAF9F5] rounded-2xl border border-dashed border-[#DEDCE7]">
          <span className="text-3xl mb-2">🔍</span>
          <h4 className="font-bold text-stone-800 text-xs mb-1">
            No se encontraron piezas
          </h4>
          <p className="text-[11px] text-stone-500 max-w-xs">
            {searchQuery
              ? `Sin resultados para "${searchQuery}".`
              : 'No hay piezas disponibles en esta categoría.'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 px-3 py-1 bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-bold rounded-xl"
            >
              Ver todas
            </button>
          )}
        </div>
      ) : (
        /* Cuadrícula de Piezas del Catálogo */
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Opción de Desequipar / Sin prenda (si la categoría no es obligatoria) */}
          {!activeCategory?.isRequired && (
            <button
              type="button"
              onClick={() => onUnequipAsset && onUnequipAsset(currentCategoryCode)}
              title="Ninguno / Desequipar"
              className={`p-3 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer relative aspect-square ${
                equippedInCurrentSlot === null || equippedInCurrentSlot === undefined
                  ? 'bg-[#EEE7FF] border-2 border-[#7446E8] shadow-xs'
                  : 'bg-[#F7F6FB] border border-[#DEDCE7] hover:border-purple-300'
              }`}
            >
              {equippedInCurrentSlot === null || equippedInCurrentSlot === undefined ? (
                <div className="w-5 h-5 rounded-full bg-[#7446E8] text-white text-[10px] font-black flex items-center justify-center absolute top-2 right-2 shadow-xs">
                  ✓
                </div>
              ) : null}

              <div className="w-full flex-1 flex items-center justify-center text-stone-400">
                <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>

              <span className="text-[11px] font-bold text-[#252137] text-center line-clamp-1">
                Ninguno
              </span>
            </button>
          )}

          {assets.map((asset) => {
            const isEquipped = equippedInCurrentSlot?.id === asset.id;
            const conflict = checkConflict(asset);

            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSelectAsset(asset)}
                title={conflict ? `Incompatible con ${conflict.equippedAsset.name}` : asset.name}
                className={`p-3 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer relative aspect-square ${
                  isEquipped
                    ? 'bg-[#EEE7FF] border-2 border-[#7446E8] shadow-xs'
                    : conflict
                    ? 'bg-rose-50/60 border border-rose-300 hover:border-rose-400'
                    : 'bg-[#F7F6FB] border border-[#DEDCE7] hover:border-purple-300'
                }`}
              >
                {/* Badge de selección check morado */}
                {isEquipped && (
                  <div className="w-5 h-5 rounded-full bg-[#7446E8] text-white text-[10px] font-black flex items-center justify-center absolute top-2 right-2 shadow-xs">
                    ✓
                  </div>
                )}

                {/* Badge de conflicto */}
                {conflict && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    !
                  </span>
                )}

                {/* Sprite de la prenda centrado */}
                <div className="w-full flex-1 flex items-center justify-center p-1">
                  <img
                    src={asset.thumbnailUrl || asset.spriteUrl}
                    alt={asset.name}
                    className="max-h-16 max-w-16 object-contain filter drop-shadow-2xs select-none"
                    draggable={false}
                  />
                </div>

                {/* Nombre de la prenda */}
                <span className="text-[11px] font-bold text-[#252137] text-center line-clamp-1 w-full mt-1">
                  {asset.name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Modal de Conflicto de Incompatibilidad */}
      {activeConflict && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border-2 border-[#252137] animate-fadeIn text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-600 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-md">
              !
            </div>

            <div>
              <h4 className="text-sm font-black text-[#252137]">
                Incompatibilidad de Piezas
              </h4>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                Esta pieza no se puede combinar con{' '}
                <strong className="text-[#252137]">"{activeConflict.equippedAsset.name}"</strong>{' '}
                actualmente equipada en tu avatar.
              </p>
              <p className="text-[11px] text-stone-500 italic mt-1">
                {activeConflict.rule.reason || 'Colisión visual entre piezas'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleResolveConflictAndEquip}
                className="w-full py-2.5 rounded-xl bg-[#7446E8] hover:bg-[#6335D7] text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
              >
                Reemplazar y equipar nueva pieza
              </button>
              <button
                type="button"
                onClick={() => setActiveConflict(null)}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold text-xs transition-all active:scale-95"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
