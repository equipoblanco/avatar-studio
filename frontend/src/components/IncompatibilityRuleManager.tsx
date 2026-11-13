import React, { useState } from 'react';
import { Asset, Category } from '../types/catalog';
import { IncompatibilityRule } from '../types/incompatibility';
import { IncompatibilityRuleModal } from './IncompatibilityRuleModal';

interface IncompatibilityRuleManagerProps {
  rules: IncompatibilityRule[];
  categories: Category[];
  assets: Asset[];
  onCreateRule: (data: any) => Promise<void>;
  onDeleteRule: (ruleId: number) => Promise<void>;
}

export const IncompatibilityRuleManager: React.FC<IncompatibilityRuleManagerProps> = ({
  rules,
  categories,
  assets,
  onCreateRule,
  onDeleteRule,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredRules = rules.filter((r) => {
    const term = searchFilter.toLowerCase();
    return (
      r.assetAName.toLowerCase().includes(term) ||
      r.assetBName.toLowerCase().includes(term) ||
      r.assetACategoryName.toLowerCase().includes(term) ||
      r.assetBCategoryName.toLowerCase().includes(term) ||
      (r.reason && r.reason.toLowerCase().includes(term))
    );
  });

  const handleDelete = async (rule: IncompatibilityRule) => {
    const confirmDelete = window.confirm(
      `¿Desea eliminar la regla de incompatibilidad entre "${rule.assetAName}" y "${rule.assetBName}"? La combinación volverá a estar permitida de inmediato en el editor.`
    );
    if (!confirmDelete) return;

    try {
      setDeletingId(rule.id);
      await onDeleteRule(rule.id);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Encabezado y barra de acciones */}
      <div className="p-5 border-b border-stone-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded">
              REGLAS
            </span>
            <h3 className="text-base font-bold text-stone-900">
              Reglas de Incompatibilidad Cruzada entre Piezas
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Bloquea combinaciones que colisionan visualmente entre capas en el editor interactivo de avatares.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Buscar por activo, categoría o motivo..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-rose-500 w-full md:w-64"
          />
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg shadow-sm whitespace-nowrap transition-colors"
          >
            + Nueva Regla
          </button>
        </div>
      </div>

      {/* Tabla de Reglas de Incompatibilidad */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-stone-600">
          <thead className="bg-stone-50 border-b border-stone-200 uppercase text-[10px] tracking-wider text-stone-500">
            <tr>
              <th className="py-3 px-4">ID Regla</th>
              <th className="py-3 px-4">Activo A (Pieza 1)</th>
              <th className="py-3 px-4 text-center">Conflicto</th>
              <th className="py-3 px-4">Activo B (Pieza 2)</th>
              <th className="py-3 px-4">Motivo / Justificación</th>
              <th className="py-3 px-4">Fecha Creación</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {filteredRules.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-stone-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">✨</span>
                    <p className="font-medium">No hay reglas de incompatibilidad registradas.</p>
                    <p className="text-[11px] text-stone-400">
                      Utilice el botón "+ Nueva Regla" para definir piezas que no deban combinarse simultáneamente.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-stone-900">#{rule.id}</td>

                  {/* Activo A */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rule.assetASpriteUrl}
                        alt={rule.assetAName}
                        className="w-9 h-9 object-contain rounded border border-stone-200 bg-stone-50"
                      />
                      <div>
                        <div className="font-semibold text-stone-800">{rule.assetAName}</div>
                        <div className="text-[10px] text-stone-400">
                          {rule.assetACategoryName} (ID #{rule.assetAId})
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Icono de Conflicto */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] tracking-wide">
                      ⚡ INCOMPATIBLE
                    </span>
                  </td>

                  {/* Activo B */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rule.assetBSpriteUrl}
                        alt={rule.assetBName}
                        className="w-9 h-9 object-contain rounded border border-stone-200 bg-stone-50"
                      />
                      <div>
                        <div className="font-semibold text-stone-800">{rule.assetBName}</div>
                        <div className="text-[10px] text-stone-400">
                          {rule.assetBCategoryName} (ID #{rule.assetBId})
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Motivo */}
                  <td className="py-3 px-4">
                    <span className="italic text-stone-700">{rule.reason || 'Sin motivo detallado'}</span>
                  </td>

                  {/* Fecha */}
                  <td className="py-3 px-4 font-mono text-[11px] text-stone-400">
                    {new Date(rule.createdAt).toLocaleDateString()}
                  </td>

                  {/* Eliminar regla */}
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(rule)}
                      disabled={deletingId === rule.id}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors disabled:opacity-50"
                    >
                      {deletingId === rule.id ? 'Eliminando...' : 'Eliminar Regla'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Creación */}
      <IncompatibilityRuleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={onCreateRule}
        categories={categories}
        assets={assets}
      />
    </div>
  );
};
