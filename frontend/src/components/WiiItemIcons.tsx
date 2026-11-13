import React from 'react';

// =============================================================================
// ÍCONOS VECTORIALES LINEALES PREMIUM (STROKE-WIDTH: 2) PARA LAS 7 CATEGORÍAS
// =============================================================================

export const WiiIconBody: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Maniquí / Busto de sastre */}
    <circle cx="12" cy="4" r="2.5" />
    <path d="M7 8.5 C7 8.5 8.5 13 9.5 14.5 C10.2 15.5 10.5 16 10.5 16 L13.5 16 C13.5 16 13.8 15.5 14.5 14.5 C15.5 13 17 8.5 17 8.5 L7 8.5 Z" />
    <line x1="12" y1="16" x2="12" y2="21" />
    <line x1="8" y1="21" x2="16" y2="21" />
  </svg>
);

export const WiiIconFace: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="9" cy="10" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1.2" fill="currentColor" stroke="none" />
    <path d="M 8.5 14.5 Q 12 17.5 15.5 14.5" />
  </svg>
);

export const WiiIconEyes: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="7" cy="12" r="4.5" />
    <circle cx="7" cy="12" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="17" cy="12" r="4.5" />
    <circle cx="17" cy="12" r="1.8" fill="currentColor" stroke="none" />
  </svg>
);

export const WiiIconMouth: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M 4 12 Q 12 18 20 12" />
    <path d="M 4 12 Q 12 6 20 12" />
  </svg>
);

export const WiiIconHair: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Mechones de cabello */}
    <path d="M4 16c0-6 3.5-12 8-12s8 6 8 12" />
    <path d="M6 14c1.5-3 3.5-5 6-5s4.5 2 6 5" />
    <path d="M9.5 7c1.5 2 1.5 4.5 0 6.5" />
  </svg>
);

export const WiiIconShirt: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Camiseta lineal */}
    <path d="M 9 3 L 15 3 L 17.5 5.5 L 22 7.5 L 20 11 L 18 10 L 18 21 L 6 21 L 6 10 L 4 11 L 2 7.5 L 6.5 5.5 Z" />
    <path d="M 9 3 Q 12 6 15 3" />
  </svg>
);

export const WiiIconPants: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Pantalones lineales */}
    <path d="M 6 4 L 18 4 L 19 14 L 16 21 L 13 21 L 12 12 L 11 21 L 8 21 L 5 14 Z" />
    <line x1="6" y1="7" x2="18" y2="7" />
  </svg>
);

export const WiiIconShoes: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Zapatilla / Sneaker lineal */}
    <path d="M 2 17 L 22 17 L 22 20 L 2 20 Z" />
    <path d="M 2 17 C 2 14 3.5 11 6.5 10 L 10 10 L 13.5 13.5 L 18 13.5 C 20.5 13.5 22 15 22 17" />
    <line x1="8" y1="13" x2="11.5" y2="10" />
  </svg>
);

export const WiiIconGlasses: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Gafas de sol lineales */}
    <rect x="2" y="9" width="8" height="6.5" rx="2.5" />
    <rect x="14" y="9" width="8" height="6.5" rx="2.5" />
    <line x1="10" y1="12" x2="14" y2="12" />
    <path d="M 2 11 L 0.5 11" />
    <path d="M 22 11 L 23.5 11" />
  </svg>
);

// =============================================================================
// ÍCONOS VECTORIALES EN ESCALA DE GRISES PARA LA CUADRÍCULA DE SELECCIÓN DE WII
// =============================================================================

// Siluetas de cabeza estilo Wii Mii (8 formas exactas del Mii Channel)
export const MiiFaceShapeSvg: React.FC<{ type: number; className?: string }> = ({ type, className = 'w-16 h-16' }) => {
  const getPath = () => {
    switch (type) {
      case 1: // Toonix cúbico redondeado canónico
        return <rect x="9" y="7" width="30" height="32" rx="10" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 2: // Circular / Redonda
        return <circle cx="24" cy="23" r="16" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 3: // Óvalo alargado
        return <ellipse cx="24" cy="23" rx="13" ry="17" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 4: // Pera / Triangular redondeada (como en la foto de Wii)
        return <path d="M 24 7 C 32 7 37 15 37 24 C 37 33 33 39 24 39 C 15 39 11 33 11 24 C 11 15 16 7 24 7 Z" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 5: // Hexágono / Diamante suave
        return <path d="M 24 7 L 37 17 L 37 29 L 24 39 L 11 29 L 11 17 Z" strokeLinejoin="round" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 6: // Cuadrado ancho
        return <rect x="7" y="9" width="34" height="28" rx="6" fill="none" stroke="#263238" strokeWidth="2.8" />;
      case 7: // Barbilla puntiaguda / Corazón
        return <path d="M 12 10 L 36 10 C 37 22 32 34 24 39 C 16 34 11 22 12 10 Z" strokeLinejoin="round" fill="none" stroke="#263238" strokeWidth="2.8" />;
      default: // Cilíndrica estándar
        return <rect x="11" y="8" width="26" height="32" rx="11" fill="none" stroke="#263238" strokeWidth="2.8" />;
    }
  };

  return (
    <svg viewBox="0 0 48 48" className={className}>
      {getPath()}
      {/* Rasgos faciales neutros tenues estilo Mii Channel */}
      <circle cx="19" cy="22" r="1.5" fill="#546E7A" />
      <circle cx="29" cy="22" r="1.5" fill="#546E7A" />
      <path d="M 21 27 Q 24 29 27 27" fill="none" stroke="#546E7A" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
};

// Íconos vectoriales para Ojos en la rejilla de Wii (Sin texto)
export const MiiEyeSvg: React.FC<{ styleId: string; className?: string }> = ({ styleId, className = 'w-16 h-12' }) => {
  return (
    <svg viewBox="0 0 64 36" className={className}>
      {styleId === 'classic' && (
        <>
          <circle cx="20" cy="18" r="4.5" fill="#1E293B" />
          <circle cx="44" cy="18" r="4.5" fill="#1E293B" />
        </>
      )}
      {styleId === 'cartoon' && (
        <>
          <ellipse cx="20" cy="18" rx="6" ry="8" fill="#1E293B" />
          <circle cx="18" cy="15" r="2" fill="#FFFFFF" />
          <ellipse cx="44" cy="18" rx="6" ry="8" fill="#1E293B" />
          <circle cx="42" cy="15" r="2" fill="#FFFFFF" />
        </>
      )}
      {styleId === 'wink' && (
        <>
          <circle cx="20" cy="18" r="5" fill="#1E293B" />
          <path d="M 38 19 Q 44 14 50 19" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
      {styleId === 'happy' && (
        <>
          <path d="M 14 20 Q 20 14 26 20" fill="none" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M 38 20 Q 44 14 50 20" fill="none" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
      {styleId === 'angry' && (
        <>
          <path d="M 12 11 L 26 15" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="19" cy="20" r="4.5" fill="#1E293B" />
          <path d="M 52 11 L 38 15" stroke="#1E293B" strokeWidth="2.8" strokeLinecap="round" />
          <circle cx="45" cy="20" r="4.5" fill="#1E293B" />
        </>
      )}
      {styleId === 'round' && (
        <>
          <circle cx="20" cy="18" r="7" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="20" cy="18" r="3" fill="#1E293B" />
          <circle cx="44" cy="18" r="7" fill="none" stroke="#1E293B" strokeWidth="2.5" />
          <circle cx="44" cy="18" r="3" fill="#1E293B" />
        </>
      )}
      {styleId === 'star' && (
        <>
          <path d="M 20 11 L 22 16 L 27 16 L 23 19 L 25 24 L 20 21 L 15 24 L 17 19 L 13 16 L 18 16 Z" fill="#1E293B" />
          <path d="M 44 11 L 46 16 L 51 16 L 47 19 L 49 24 L 44 21 L 39 24 L 41 19 L 37 16 L 42 16 Z" fill="#1E293B" />
        </>
      )}
      {styleId === 'sleepy' && (
        <>
          <line x1="14" y1="18" x2="26" y2="18" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
          <line x1="38" y1="18" x2="50" y2="18" stroke="#1E293B" strokeWidth="3.2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
};

// Íconos vectoriales para Bocas en la rejilla de Wii (Sin texto)
export const MiiMouthSvg: React.FC<{ styleId: string; className?: string }> = ({ styleId, className = 'w-16 h-12' }) => {
  return (
    <svg viewBox="0 0 64 36" className={className}>
      {styleId === 'neutral' && (
        <line x1="18" y1="18" x2="46" y2="18" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      )}
      {styleId === 'smile' && (
        <path d="M 18 15 Q 32 26 46 15" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      )}
      {styleId === 'teeth' && (
        <rect x="20" y="13" width="24" height="10" rx="4" fill="#FFFFFF" stroke="#1E293B" strokeWidth="2.5" />
      )}
      {styleId === 'open' && (
        <ellipse cx="32" cy="18" rx="8" ry="10" fill="#1E293B" />
      )}
      {styleId === 'smirk' && (
        <path d="M 22 20 Q 34 22 44 14" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      )}
      {styleId === 'tongue' && (
        <>
          <path d="M 20 15 Q 32 23 44 15" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
          <path d="M 28 18 Q 32 27 36 18 Z" fill="#E11D48" stroke="#1E293B" strokeWidth="1.5" />
        </>
      )}
      {styleId === 'frown' && (
        <path d="M 18 22 Q 32 12 46 22" fill="none" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
};

// Cursor de Mano de Nintendo Wii con "1" azul clásico (Foto de Wii)
export const WiiHandCursor: React.FC<{ className?: string }> = ({ className = 'w-9 h-11' }) => {
  return (
    <svg viewBox="0 0 36 44" className={className} filter="drop-shadow(1px 3px 2px rgba(0,0,0,0.35))">
      {/* Guante blanco con dedo índice apuntando */}
      <path
        d="M 14 3 C 14 1.5 16 0 18 0 C 20 0 22 1.5 22 3 L 22 18 L 24 16 C 26 14.5 28.5 15.5 29 17.5 C 29.5 19 28.5 20.5 27.5 21.5 L 31 23 C 33 24 33.5 26.5 32 28.5 C 31 30 29.5 31 28 31.5 L 30 34 C 30.5 36 29 38 27 39 C 23 41 17 41 12 37 L 7 28 C 5.5 25.5 6.5 22.5 9 21 C 11.5 19.5 14 21 14 23 Z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Círculo azul con "1" */}
      <circle cx="21" cy="31" r="5.5" fill="#0284C7" />
      <text x="21" y="34.5" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif">
        1
      </text>
    </svg>
  );
};
