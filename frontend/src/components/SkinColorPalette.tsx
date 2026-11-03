import React from 'react';

export interface SkinColorOption {
  name: string;
  hex: string;
  isDark?: boolean;
}

export const TOONIX_SKIN_PALETTE: SkinColorOption[] = [
  { name: 'Blanco Toonix Clásico',  hex: '#FFFFFF', isDark: false },
  { name: 'Cyan Eléctrico',         hex: '#00E5FF', isDark: false },
  { name: 'Azul Sónico',            hex: '#2563EB', isDark: true  },
  { name: 'Azul Cósmico',           hex: '#1E1B4B', isDark: true  },
  { name: 'Naranja Cartoon',        hex: '#FF6B00', isDark: true  },
  { name: 'Amarillo Radioactivo',   hex: '#FACC15', isDark: false },
  { name: 'Verde Lima Toonix',      hex: '#84CC16', isDark: false },
  { name: 'Verde Menta Neón',       hex: '#10B981', isDark: true  },
  { name: 'Verde Alienígena',       hex: '#4ADE80', isDark: false },
  { name: 'Rojo Fuego',             hex: '#EF4444', isDark: true  },
  { name: 'Rosa Chicle',            hex: '#F472B6', isDark: false },
  { name: 'Fucsia Neón',            hex: '#D946EF', isDark: true  },
  { name: 'Morado Galaxia',         hex: '#8B5CF6', isDark: true  },
  { name: 'Durazno Suave',          hex: '#FED7AA', isDark: false },
  { name: 'Caramelo Tostado',       hex: '#D97706', isDark: true  },
  { name: 'Marrón Chocolate',       hex: '#78350F', isDark: true  },
  { name: 'Gris Titanio',           hex: '#94A3B8', isDark: false },
  { name: 'Negro Sombra',           hex: '#18181B', isDark: true  },
];

interface SkinColorPaletteProps {
  selectedColor: string;
  onSelectColor: (colorHex: string) => void;
}

/**
 * Paleta de Colores en Cuadritos estilo Wii Mii & Toonix Creator (Foto 2 y 4)
 * Permite seleccionar entre más de 10 colores vibrantes de piel y fantasía sin RGB manual.
 */
export const SkinColorPalette: React.FC<SkinColorPaletteProps> = ({
  selectedColor,
  onSelectColor,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-stone-200/80 shadow-sm space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-extrabold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <span>🎨 Tono de Piel Toonix (Fantasía)</span>
        </label>
        <span className="text-[10px] font-mono text-stone-400 font-semibold uppercase">
          {TOONIX_SKIN_PALETTE.find((c) => c.hex.toLowerCase() === selectedColor.toLowerCase())?.name || selectedColor}
        </span>
      </div>

      {/* Rejilla de Cuadritos de Color estilo Wii Mii / Toonix Creator */}
      <div className="grid grid-cols-6 sm:grid-cols-9 gap-2">
        {TOONIX_SKIN_PALETTE.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.hex.toLowerCase();

          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onSelectColor(color.hex)}
              title={color.name}
              className={`w-8 h-8 rounded-xl transition-all relative flex items-center justify-center transform ${
                isSelected
                  ? 'ring-2 ring-amber-500 ring-offset-2 scale-110 z-10 shadow-md'
                  : 'hover:scale-105 hover:shadow-sm border border-black/10'
              }`}
              style={{
                backgroundColor: color.hex,
                boxShadow: isSelected ? '0 0 10px rgba(245, 158, 11, 0.4)' : undefined,
              }}
            >
              {isSelected && (
                <span
                  className={`text-xs font-black ${
                    color.isDark ? 'text-white' : 'text-stone-900'
                  }`}
                >
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
