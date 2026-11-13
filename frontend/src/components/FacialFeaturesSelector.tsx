import React, { useState } from 'react';
import { EyeStyle, MouthStyle } from './ToonixPreviewer';

interface FacialFeaturesSelectorProps {
  currentEyeStyle: EyeStyle;
  currentMouthStyle: MouthStyle;
  onSelectEyes: (eyes: EyeStyle) => void;
  onSelectMouth: (mouth: MouthStyle) => void;
}

interface EyeOption {
  id: EyeStyle;
  label: string;
  preview: string;
}

interface MouthOption {
  id: MouthStyle;
  label: string;
  preview: string;
}

const EYES_OPTIONS: EyeOption[] = [
  { id: 'classic', label: 'Toonix Clásico', preview: '●   ●' },
  { id: 'cartoon', label: 'Pupilas Brillantes (CN)', preview: '👁️  👁️' },
  { id: 'wink',    label: 'Guiño Pícaro', preview: '●   ^' },
  { id: 'happy',   label: 'Feliz / Sonriente', preview: '^   ^' },
  { id: 'angry',   label: 'Ceño Determinado', preview: '`●  ●´' },
  { id: 'round',   label: 'Redondos Abiertos', preview: '◯   ◯' },
  { id: 'star',    label: 'Estrellas Pop', preview: '★   ★' },
  { id: 'sleepy',  label: 'Relajado / Dormilón', preview: '—   —' },
];

const MOUTH_OPTIONS: MouthOption[] = [
  { id: 'neutral', label: 'Línea Toonix', preview: '——' },
  { id: 'smile',   label: 'Sonrisa Clásica', preview: '◡' },
  { id: 'teeth',   label: 'Sonrisa Dientes (CN)', preview: '😬' },
  { id: 'open',    label: 'Boca Abierta', preview: '😮' },
  { id: 'smirk',   label: 'Medio Lado Pícara', preview: '😏' },
  { id: 'tongue',  label: 'Lengua Afuera', preview: '😛' },
  { id: 'frown',   label: 'Puchero / Seria', preview: '◠' },
];

/**
 * Selector de Expresiones Faciales (Ojos y Bocas) estilo Nintendo Wii Mii & Toonix Creator
 */
export const FacialFeaturesSelector: React.FC<FacialFeaturesSelectorProps> = ({
  currentEyeStyle,
  currentMouthStyle,
  onSelectEyes,
  onSelectMouth,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'eyes' | 'mouth'>('eyes');

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Sub-pestañas de Selección Facial estilo Mii */}
      <div className="flex border-b border-stone-200 bg-stone-100 p-1.5 gap-1.5">
        <button
          type="button"
          onClick={() => setActiveSubTab('eyes')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'eyes'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>👁️</span>
          <span>Ojos Toonix</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('mouth')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'mouth'
              ? 'bg-white text-stone-900 shadow-sm'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          <span>👄</span>
          <span>Bocas & Expresión</span>
        </button>
      </div>

      <div className="p-4">
        {/* Rejilla de Ojos */}
        {activeSubTab === 'eyes' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {EYES_OPTIONS.map((opt) => {
              const isSelected = currentEyeStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectEyes(opt.id)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-16 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-sm font-black font-mono tracking-widest text-stone-800 group-hover:scale-105 transition-transform">
                    {opt.preview}
                  </div>
                  <span className="text-[11px] font-bold text-stone-700 text-center line-clamp-1">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                      isSelected ? 'bg-emerald-600 text-white' : 'text-stone-400'
                    }`}
                  >
                    {isSelected ? '✓ Seleccionado' : 'Elegir'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Rejilla de Bocas */}
        {activeSubTab === 'mouth' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MOUTH_OPTIONS.map((opt) => {
              const isSelected = currentMouthStyle === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onSelectMouth(opt.id)}
                  className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1.5 group ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-400'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="w-16 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-lg font-black text-stone-800 group-hover:scale-105 transition-transform">
                    {opt.preview}
                  </div>
                  <span className="text-[11px] font-bold text-stone-700 text-center line-clamp-1">
                    {opt.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.2 rounded-full uppercase ${
                      isSelected ? 'bg-emerald-600 text-white' : 'text-stone-400'
                    }`}
                  >
                    {isSelected ? '✓ Seleccionado' : 'Elegir'}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
