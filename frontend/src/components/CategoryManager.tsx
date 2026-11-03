import React, { useState } from 'react';
import { Asset, Category } from '../types/catalog';

interface CategoryManagerProps {
  categories: Category[];
  assets: Asset[];
  onSetDefaultAsset: (categoryId: number, defaultAssetId: number) => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  assets,
  onSetDefaultAsset,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState<number | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleOpenModal = (category: Category) => {
    setSelectedCategory(category);
    setSelectedAssetId(category.defaultAssetId);
    setFeedbackMsg(null);
  };

  const handleSave = async () => {
    if (!selectedCategory || !selectedAssetId) return;
    try {
      setIsUpdating(true);
      await onSetDefaultAsset(selectedCategory.id, selectedAssetId);
      setFeedbackMsg('Pieza predeterminada actualizada correctamente.');
      setTimeout(() => {
        setSelectedCategory(null);
        setFeedbackMsg(null);
      }, 1200);
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const availableAssetsForCategory = selectedCategory
    ? assets.filter((a) => a.categoryId === selectedCategory.id && a.status === 'ACTIVE')
    : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Gestión de las 7 Categorías y Piezas Predeterminadas
          </h3>
          <p className="text-xs text-stone-500">
            Define la pieza base obligatoria que reemplazará a cualquier ítem desactivado en los outfits guardados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col justify-between hover:border-amber-400 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                  {cat.code}
                </span>
                <span className="text-xs font-mono text-stone-500">Z: {cat.zIndexDefault}</span>
              </div>
              <h4 className="font-bold text-sm text-stone-800">{cat.name}</h4>
              <div className="mt-3 p-2 bg-white rounded-lg border border-stone-200 flex items-center gap-3">
                {cat.defaultAssetSpriteUrl && (
                  <img
                    src={cat.defaultAssetSpriteUrl}
                    alt={cat.defaultAssetName || 'Default'}
                    className="w-10 h-10 object-contain rounded bg-stone-100"
                  />
                )}
                <div className="overflow-hidden">
                  <div className="text-[10px] text-stone-400 font-semibold uppercase">Fallback Activo</div>
                  <div className="text-xs font-medium text-stone-800 truncate">
                    {cat.defaultAssetName || 'Sin asignar'}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleOpenModal(cat)}
              className="mt-4 w-full py-1.5 px-3 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              Cambiar Fallback
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Asignación de Fallback */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h4 className="text-base font-bold text-stone-900 mb-1">
              Configurar Fallback: {selectedCategory.name}
            </h4>
            <p className="text-xs text-stone-500 mb-4">
              Seleccione la pieza que servirá de respaldo si un activo de esta categoría es dado de baja.
            </p>

            {feedbackMsg && (
              <div className="mb-4 p-2.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg">
                {feedbackMsg}
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-stone-700 uppercase">Activos Activos</label>
              <select
                value={selectedAssetId || ''}
                onChange={(e) => setSelectedAssetId(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              >
                {availableAssetsForCategory.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    #{asset.id} - {asset.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-100">
              <button
                onClick={() => setSelectedCategory(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm"
              >
                {isUpdating ? 'Actualizando...' : 'Confirmar Fallback'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

