import React, { useState, useEffect } from 'react';
import { Asset, Category } from '../types/catalog';
import { IncompatibilityRuleFormData } from '../types/incompatibility';

interface IncompatibilityRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: IncompatibilityRuleFormData) => Promise<void>;
  categories: Category[];
  assets: Asset[];
}

export const IncompatibilityRuleModal: React.FC<IncompatibilityRuleModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  assets,
}) => {
  const [catAId, setCatAId] = useState<number>(categories[0]?.id || 1);
  const [assetAId, setAssetAId] = useState<number | null>(null);
  const [catBId, setCatBId] = useState<number>(categories[1]?.id || categories[0]?.id || 1);
  const [assetBId, setAssetBId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrar activos activos por categoría
  const assetsForCatA = assets.filter((a) => a.categoryId === catAId && a.status === 'ACTIVE');
  const assetsForCatB = assets.filter((a) => a.categoryId === catBId && a.status === 'ACTIVE');

  useEffect(() => {
    if (assetsForCatA.length > 0 && (!assetAId || !assetsForCatA.some((a) => a.id === assetAId))) {
      setAssetAId(assetsForCatA[0].id);
    }
  }, [catAId, assetsForCatA]);

  useEffect(() => {
    if (assetsForCatB.length > 0 && (!assetBId || !assetsForCatB.some((a) => a.id === assetBId))) {
      setAssetBId(assetsForCatB[0].id);
    }
  }, [catBId, assetsForCatB]);

  if (!isOpen) return null;

  const assetA = assets.find((a) => a.id === assetAId);
  const assetB = assets.find((a) => a.id === assetBId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!assetAId || !assetBId) {
      setErrorMsg('Debe seleccionar ambos activos cosméticos.');
      return;
    }

    if (assetAId === assetBId) {
      setErrorMsg('No puede definir una regla de incompatibilidad de un activo consigo mismo.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        assetAId,
        assetBId,
        reason: reason.trim() || `Incompatibilidad visual entre ${assetA?.name} y ${assetB?.name}`,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar la regla de incompatibilidad.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Nueva Regla de Incompatibilidad
            </h3>
            <p className="text-xs text-stone-500">
              Impedirá de inmediato que los usuarios equipen ambos activos simultáneamente en el editor.
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-lg">✕</button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Visual Collision Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-stone-500 mb-1">Activo A</span>
              <img
                src={assetA?.thumbnailUrl || assetA?.spriteUrl || ''}
                alt={assetA?.name || 'Activo A'}
                className="w-16 h-16 object-contain rounded-lg border border-stone-300 bg-white shadow-sm"
              />
              <span className="text-xs font-semibold text-stone-800 mt-1 max-w-[120px] truncate text-center">
                {assetA?.name || 'Seleccione Activo'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Z: {assetA?.zIndex}</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full font-bold text-xs tracking-wider">
                ⚡ COLISIÓN
              </span>
              <span className="text-[10px] text-stone-400 mt-1 font-mono">Bloqueo Mutuo</span>
            </div>

            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase text-stone-500 mb-1">Activo B</span>
              <img
                src={assetB?.thumbnailUrl || assetB?.spriteUrl || ''}
                alt={assetB?.name || 'Activo B'}
                className="w-16 h-16 object-contain rounded-lg border border-stone-300 bg-white shadow-sm"
              />
              <span className="text-xs font-semibold text-stone-800 mt-1 max-w-[120px] truncate text-center">
                {assetB?.name || 'Seleccione Activo'}
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Z: {assetB?.zIndex}</span>
            </div>
          </div>

          {/* Selectores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Activo A */}
            <div className="space-y-2 p-3 bg-stone-50/70 rounded-xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-700 uppercase">1. Primer Activo (A)</label>
              <select
                value={catAId}
                onChange={(e) => setCatAId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>Categoría: {c.name}</option>
                ))}
              </select>
              <select
                value={assetAId || ''}
                onChange={(e) => setAssetAId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {assetsForCatA.map((a) => (
                  <option key={a.id} value={a.id}>#{a.id} - {a.name} (Z:{a.zIndex})</option>
                ))}
              </select>
            </div>

            {/* Activo B */}
            <div className="space-y-2 p-3 bg-stone-50/70 rounded-xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-700 uppercase">2. Segundo Activo (B)</label>
              <select
                value={catBId}
                onChange={(e) => setCatBId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>Categoría: {c.name}</option>
                ))}
              </select>
              <select
                value={assetBId || ''}
                onChange={(e) => setAssetBId(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs border rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                {assetsForCatB.map((a) => (
                  <option key={a.id} value={a.id}>#{a.id} - {a.name} (Z:{a.zIndex})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Motivo o Justificación Técnica de Colisión
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Colisión de volumen 2D entre sombrero y peinado voluminoso"
              className="w-full px-3 py-2 text-xs border rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Regla de Incompatibilidad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
