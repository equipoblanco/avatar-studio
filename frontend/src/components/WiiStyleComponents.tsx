import React from 'react';
import { BodyPatternType } from './ToonixPreviewer';

// =============================================================================
// PALETA DE COLORES TOONIX EN CUADRITOS COMPACTOS (Estilo Wii Mii)
// =============================================================================
export interface WiiColorOption {
  id: string;
  name: string;
  hex: string;
}

export const AVATAR_BASE_COLORS: WiiColorOption[] = [
  // Fila 1: Fantasía y clásicos
  { id: 'white',   name: 'Blanco Puro',    hex: '#FFFFFF' },
  { id: 'cyan',    name: 'Cian Eléctrico', hex: '#00E5FF' },
  { id: 'lime',    name: 'Verde Lima',     hex: '#84CC16' },
  { id: 'yellow',  name: 'Amarillo Solar', hex: '#FACC15' },
  { id: 'orange',  name: 'Naranja Vivo',   hex: '#FF6B00' },
  { id: 'pink',    name: 'Rosa Chicle',    hex: '#F472B6' },
  // Fila 2: Tonos intensos (sin color negro)
  { id: 'purple',  name: 'Púrpura Mágico', hex: '#8B5CF6' },
  { id: 'blue',    name: 'Azul Real',      hex: '#2563EB' },
  { id: 'peach',   name: 'Melocotón',      hex: '#FED7AA' },
  { id: 'caramel', name: 'Caramelo',       hex: '#D97706' },
  { id: 'gray',    name: 'Gris Platino',   hex: '#94A3B8' },
  { id: 'red',     name: 'Rojo Carmesí',   hex: '#EF4444' },
];

export const WII_TOONIX_COLORS = AVATAR_BASE_COLORS;

export interface PatternOption {
  id: BodyPatternType;
  name: string;
}

export const WII_PATTERNS: PatternOption[] = [
  { id: 'none',    name: 'Liso' },
  { id: 'stripes', name: 'Rayas' },
  { id: 'dots',    name: 'Lunares' },
  { id: 'checker', name: 'Cuadros' },
  { id: 'stars',   name: 'Estrellas' },
  { id: 'camo',    name: 'Camuflaje' },
  { id: 'hearts',  name: 'Corazones' },
  { id: 'zigzag',  name: 'Zigzag' },
];

interface WiiColorPaletteProps {
  selectedHex: string;
  onSelect: (hex: string) => void;
}

export const WiiColorPalette: React.FC<WiiColorPaletteProps> = ({ selectedHex, onSelect }) => {
  return (
    <div className="bg-[#CBD5E1]/60 p-2 rounded-2xl border-2 border-[#94A3B8] shadow-inner inline-flex flex-col gap-1.5">
      <div className="grid grid-cols-6 gap-1.5">
        {WII_TOONIX_COLORS.slice(0, 6).map((c) => {
          const isSelected = selectedHex.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.hex)}
              title={c.name}
              className={`w-7 h-7 rounded-xl transition-all relative ${
                isSelected
                  ? 'ring-2 ring-[#00BA76] ring-offset-1 scale-110 z-10 shadow'
                  : 'border border-black/20 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BA76] absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>
      <div className="grid grid-cols-6 gap-1.5">
        {WII_TOONIX_COLORS.slice(6, 12).map((c) => {
          const isSelected = selectedHex.toLowerCase() === c.hex.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.hex)}
              title={c.name}
              className={`w-7 h-7 rounded-xl transition-all relative ${
                isSelected
                  ? 'ring-2 ring-[#00BA76] ring-offset-1 scale-110 z-10 shadow'
                  : 'border border-black/20 hover:scale-105'
              }`}
              style={{ backgroundColor: c.hex }}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#00BA76] absolute top-1 right-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// =============================================================================
// BOTÓN OVALADO GRIS OSCURO TIPO 'GUARDAR' DE WII
// =============================================================================
interface WiiQuitButtonProps {
  label?: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const WiiQuitButton: React.FC<WiiQuitButtonProps> = ({
  label = 'Guardar',
  onClick,
  isLoading = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="relative group w-full max-w-[200px] py-2.5 rounded-2xl bg-gradient-to-b from-[#60727A] via-[#4D5E66] to-[#39464C] border-[3px] border-[#252E33] shadow-md hover:brightness-110 active:scale-95 transition-all text-white font-extrabold text-sm tracking-wider flex items-center justify-center gap-2 select-none overflow-hidden"
    >
      {/* Brillo superior característico de la interfaz de Wii */}
      <div className="absolute top-0 left-0 right-0 h-[45%] bg-gradient-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
      <span>{isLoading ? 'Guardando...' : label}</span>
    </button>
  );
};

// =============================================================================
// SCANLINES CONTAINER (Fondo gris claro con líneas horizontales suaves)
// =============================================================================
export const WiiScanlinesPanel: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div
      className={`rounded-3xl border-4 border-[#B0BEC5] shadow-sm relative overflow-hidden ${className}`}
      style={{
        backgroundColor: '#DEE5E8',
        backgroundImage:
          'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0, 0, 0, 0.035) 3px, rgba(0, 0, 0, 0.035) 4px)',
      }}
    >
      {children}
    </div>
  );
};

// =============================================================================
// RENDERIZADOR DE CUADRITO DE PATRÓN PARA LA CATEGORÍA BASE
// =============================================================================
export const PatternIconSvg: React.FC<{ pattern: BodyPatternType; className?: string }> = ({
  pattern,
  className = 'w-10 h-10',
}) => {
  return (
    <svg viewBox="0 0 40 40" className={className}>
      {pattern === 'none' && (
        <circle cx="20" cy="20" r="14" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="2.5" />
      )}
      {pattern === 'stripes' && (
        <>
          <rect x="4" y="6" width="32" height="5" rx="2" fill="#475569" />
          <rect x="4" y="15" width="32" height="5" rx="2" fill="#475569" />
          <rect x="4" y="24" width="32" height="5" rx="2" fill="#475569" />
          <rect x="4" y="33" width="32" height="4" rx="2" fill="#475569" />
        </>
      )}
      {pattern === 'dots' && (
        <>
          <circle cx="12" cy="12" r="4" fill="#475569" />
          <circle cx="28" cy="12" r="4" fill="#475569" />
          <circle cx="20" cy="20" r="4" fill="#475569" />
          <circle cx="12" cy="28" r="4" fill="#475569" />
          <circle cx="28" cy="28" r="4" fill="#475569" />
        </>
      )}
      {pattern === 'checker' && (
        <>
          <rect x="6" y="6" width="14" height="14" fill="#475569" />
          <rect x="20" y="20" width="14" height="14" fill="#475569" />
          <rect x="20" y="6" width="14" height="14" fill="#CBD5E1" />
          <rect x="6" y="20" width="14" height="14" fill="#CBD5E1" />
        </>
      )}
      {pattern === 'stars' && (
        <>
          <polygon points="12,5 14,9 18,9 15,12 16,16 12,14 8,16 9,12 6,9 10,9" fill="#F59E0B" />
          <polygon points="28,21 30,25 34,25 31,28 32,32 28,30 24,32 25,28 22,25 26,25" fill="#F59E0B" />
          <polygon points="28,7 29.5,10 32.5,10 30,12 31,15 28,13.5 25,15 26,12 23.5,10 26.5,10" fill="#F59E0B" />
        </>
      )}
      {pattern === 'camo' && (
        <>
          <ellipse cx="14" cy="14" rx="8" ry="6" fill="#4D7C0F" />
          <ellipse cx="28" cy="18" rx="7" ry="9" fill="#15803D" />
          <ellipse cx="18" cy="28" rx="10" ry="6" fill="#365314" />
        </>
      )}
      {pattern === 'hearts' && (
        <>
          <path d="M 12 10 Q 12 6 16 6 Q 20 6 20 10 Q 20 14 12 18 Q 4 14 4 10 Q 4 6 8 6 Q 12 6 12 10 Z" fill="#F43F5E" />
          <path d="M 28 22 Q 28 18 32 18 Q 36 18 36 22 Q 36 26 28 30 Q 20 26 20 22 Q 20 18 24 18 Q 28 18 28 22 Z" fill="#F43F5E" />
        </>
      )}
      {pattern === 'zigzag' && (
        <>
          <path d="M 4 12 L 12 6 L 20 12 L 28 6 L 36 12" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 4 24 L 12 18 L 20 24 L 28 18 L 36 24" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 4 34 L 12 28 L 20 34 L 28 28 L 36 34" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};
