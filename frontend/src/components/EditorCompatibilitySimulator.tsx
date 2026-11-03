import React, { useState } from 'react';
import { Asset } from '../types/catalog';
import { adminIncompatibilityApi } from '../services/adminIncompatibilityApi';
import { CompatibilityCheckResponse } from '../types/incompatibility';

interface EditorCompatibilitySimulatorProps {
  assets: Asset[];
}

export const EditorCompatibilitySimulator: React.FC<EditorCompatibilitySimulatorProps> = ({ assets }) => {
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [checkResult, setCheckResult] = useState<CompatibilityCheckResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const toggleAsset = (assetId: number) => {
    setSelectedAssetIds((prev) =>
      prev.includes(assetId) ? prev.filter((id) => id !== assetId) : [...prev, assetId]
    );
    setCheckResult(null);
  };

  const handleTestCompatibility = async () => {
    if (selectedAssetIds.length < 2) return;
    try {
      setIsChecking(true);
      const res = await adminIncompatibilityApi.checkCompatibility(selectedAssetIds);
      setCheckResult(res);
    } catch (err: any) {
      alert(`Error al probar compatibilidad: ${err.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-5 mt-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold uppercase rounded">
              SIMULADOR
            </span>
            <h4 className="text-sm font-bold text-stone-900">
              Banco de Pruebas: Verificación Inmediata en Editor
            </h4>
          </div>
          <p className="text-xs text-stone-500">
            Seleccione 2 o más activos para verificar en tiempo real si el motor de reglas bloquea o permite la combinación.
          </p>
        </div>

        <button
          onClick={handleTestCompatibility}
          disabled={selectedAssetIds.length < 2 || isChecking}
          className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-lg shadow-sm transition-all"
        >
          {isChecking ? 'Verificando...' : 'Probar Combinación'}
        </button>
      </div>

      {/* Grid de Selección Rápida */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-4">
        {assets.map((asset) => {
          const isSelected = selectedAssetIds.includes(asset.id);
          return (
            <div
              key={asset.id}
              onClick={() => toggleAsset(asset.id)}
              className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                  : 'border-stone-200 bg-stone-50 hover:border-stone-300'
              }`}
            >
              <img
                src={asset.thumbnailUrl || asset.spriteUrl}
                alt={asset.name}
                className="w-12 h-12 object-contain rounded bg-white border border-stone-200 mb-1.5"
              />
              <span className="text-[11px] font-bold text-stone-800 line-clamp-1">{asset.name}</span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">{asset.categoryName}</span>
              <span
                className={`mt-1.5 px-2 py-0.5 rounded text-[9px] font-bold ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-stone-200 text-stone-600'
                }`}
              >
                {isSelected ? 'Equipado' : 'Equipar'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Resultado de la Prueba en Vivo */}
      {checkResult && (
        <div
          className={`p-4 rounded-xl border text-xs animate-fadeIn ${
            checkResult.compatible
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 font-bold mb-1">
            <span className="text-base">{checkResult.compatible ? '✅' : '🚫'}</span>
            <span>
              {checkResult.compatible
                ? 'Combinación VÁLIDA: Todas las piezas son compatibles entre sí.'
                : 'Combinación BLOQUEADA: Se detectaron colisiones de compatibilidad.'}
            </span>
          </div>

          {!checkResult.compatible && (
            <ul className="list-disc list-inside mt-2 space-y-1 text-[11px] pl-2 font-medium">
              {checkResult.conflicts.map((c) => (
                <li key={c.ruleId}>
                  Regla #{c.ruleId}: <span className="font-bold">{c.assetAName}</span> colisiona con{' '}
                  <span className="font-bold">{c.assetBName}</span>. Motivo: {c.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
