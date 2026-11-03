import React, { useState } from 'react';
import { Asset, AssetStatus, Category } from '../types/catalog';

interface AssetCatalogTableProps {
  assets: Asset[];
  categories: Category[];
  selectedCategoryId: number | null;
  onSelectCategory: (catId: number | null) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onToggleStatus: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onAddNew: () => void;
}

export const AssetCatalogTable: React.FC<AssetCatalogTableProps> = ({
  assets,
  categories,
  selectedCategoryId,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onToggleStatus,
  onEditAsset,
  onAddNew,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Barra de herramientas y filtros superiores */}
      <div className="p-4 border-b border-stone-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategoryId === null
                ? 'bg-amber-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategoryId === cat.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre o etiqueta..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none w-full md:w-64"
          />
          <button
            onClick={onAddNew}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs rounded-lg shadow-sm whitespace-nowrap"
          >
            + Nuevo Activo
          </button>
        </div>
      </div>

      {/* Tabla de Activos */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] tracking-wider text-stone-500">
            <tr>
              <th className="py-3 px-4">Sprite</th>
              <th className="py-3 px-4">ID</th>
              <th className="py-3 px-4">Nombre</th>
              <th className="py-3 px-4">Categoría</th>
              <th className="py-3 px-4">Z-Index</th>
              <th className="py-3 px-4">Tinte RGB</th>
              <th className="py-3 px-4">Fallback</th>
              <th className="py-3 px-4">Estado (Baja Lógica)</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-stone-400">
                  No se encontraron activos cosméticos con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              assets.map((asset) => (
                <tr key={asset.id} className="hover:bg-amber-50/30 transition-colors">
                  <td className="py-2 px-4">
                    <img
                      src={asset.thumbnailUrl || asset.spriteUrl}
                      alt={asset.name}
                      className="w-10 h-10 object-contain rounded border border-stone-200 bg-stone-50"
                    />
                  </td>
                  <td className="py-2 px-4 font-mono font-medium text-stone-900">#{asset.id}</td>
                  <td className="py-2 px-4 font-semibold text-stone-800">{asset.name}</td>
                  <td className="py-2 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px]">
                      {asset.categoryName}
                    </span>
                  </td>
                  <td className="py-2 px-4 font-mono">{asset.zIndex}</td>
                  <td className="py-2 px-4">
                    {asset.supportsTint ? (
                      <span className="text-emerald-700 font-medium">Sí (RGB)</span>
                    ) : (
                      <span className="text-stone-400">No</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {asset.isDefault ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                        ★ DEFAULT
                      </span>
                    ) : (
                      <span className="text-stone-400">-</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {/* Switch de activación/desactivación en caliente (Soft Delete) */}
                    <button
                      onClick={() => onToggleStatus(asset)}
                      disabled={asset.isDefault}
                      title={
                        asset.isDefault
                          ? 'No puede desactivar la pieza predeterminada de la categoría'
                          : 'Alternar estado activo/inactivo'
                      }
                      className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wide transition-all ${
                        asset.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                      } ${asset.isDefault ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {asset.status === 'ACTIVE' ? '● ACTIVO' : '○ INACTIVO'}
                    </button>
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => onEditAsset(asset)}
                      className="text-amber-600 hover:text-amber-800 font-semibold text-xs"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

