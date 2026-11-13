import React from 'react';

/**
 * ==========================================================================================
 * TIPOS DE DATOS (TypeScript)
 * ==========================================================================================
 * Hemos añadido la opción 'none' a los tipos para permitir que el avatar 
 * no tenga ojos o boca (estado vacío por defecto).
 */
export type EyeStyle = 'none' | 'classic' | 'cartoon' | 'wink' | 'happy' | 'angry' | 'star' | 'sleepy' | 'round';
export type MouthStyle = 'none' | 'neutral' | 'smile' | 'teeth' | 'open' | 'smirk' | 'tongue' | 'frown' | 'laugh' | 'whistle' | 'cat' | 'fangs' | 'wavy';
export type BodyPatternType = 'none' | 'stripes' | 'dots' | 'checker' | 'stars' | 'camo' | 'hearts' | 'zigzag';

/**
 * ==========================================================================================
 * PROPIEDADES DEL COMPONENTE
 * ==========================================================================================
 * Son los "ajustes" que recibe este componente desde la página principal (Editor).
 */
interface ToonixPreviewerProps {
  skinColorHex?: string;         // Color de piel (mantenido por compatibilidad, no se usa visualmente aquí)
  bodyPattern?: BodyPatternType; // Patrón de la piel (mantenido por compatibilidad)
  eyesStyle?: EyeStyle;          // El estilo de ojos seleccionado (ej: 'classic' o 'none')
  mouthStyle?: MouthStyle;       // El estilo de boca seleccionado (ej: 'smile' o 'none')
  width?: number;                // Ancho del lienzo (por defecto 320px)
  height?: number;               // Alto del lienzo (por defecto 320px)
  showPedestal?: boolean;        // Si queremos mostrar la sombra en el suelo
}

/**
 * ==========================================================================================
 * COMPONENTE PRINCIPAL: ToonixPreviewer
 * ==========================================================================================
 * Este componente dibuja al Mango (Toonix) base y le superpone los ojos y la boca
 * seleccionados por el usuario.
 */
export const ToonixPreviewer: React.FC<ToonixPreviewerProps> = ({
  eyesStyle = 'none',  // Por defecto, el avatar no tiene ojos
  mouthStyle = 'none', // Por defecto, el avatar no tiene boca
  width = 320,
  height = 320,
  showPedestal = true,
}) => {
  return (
    /* 
      1. CONTENEDOR PRINCIPAL:
      - 'relative': Permite que los ojos y la boca se posicionen de forma absoluta respecto a esta caja.
      - 'select-none': Evita que el usuario seleccione la imagen como si fuera texto.
      - style: Aplica el ancho y alto dinámicos.
    */
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width, height }}>

      {/* 
        2. SOMBRA / PEDESTAL:
        - 'absolute bottom-2': Lo posiciona cerca del borde inferior.
        - 'blur-sm': Le da el efecto de difuminado para que parezca una sombra real.
        - z-index bajo: Al no tener z-index explícito, se queda al fondo.
      */}
      {showPedestal && (
        <div className="absolute bottom-2 w-32 h-6 bg-black/15 rounded-[100%] blur-sm" />
      )}

      {/* 
        3. EL CUERPO DEL MANGO (Imagen Base):
        - src: Carga la imagen que guardaste en la carpeta public.
        - 'relative z-10': Asegura que el cuerpo esté POR ENCIMA de la sombra.
        - 'object-contain': Evita que la imagen se deforme si el contenedor cambia de tamaño.
        - 'drop-shadow-sm': Le da un pequeño borde de sombra a la silueta.
      */}
      <img
        src="/mango_base.png"
        alt="Mango Base"
        className="relative z-10 w-full h-full object-contain drop-shadow-sm"
      />

      {/* 
        4. LOS OJOS (Renderizado Condicional):
        - Solo se dibujan si 'eyesStyle' NO es igual a 'none'.
        - 'absolute top-[38%]': Los coloca flotando al 38% de la altura del lienzo.
        - 'z-20': Asegura que se dibujen POR ENCIMA del cuerpo del Mango.
        - 'gap-12': Separa el ojo izquierdo del derecho.
      */}
      {eyesStyle !== 'none' && (
        <div className="absolute top-[38%] z-20 flex gap-12 justify-center w-full">
          {/* Ojos Clásicos: Dos puntos negros */}
          {eyesStyle === 'classic' && (
            <><div className="w-3.5 h-3.5 bg-[#3E2723] rounded-full" /><div className="w-3.5 h-3.5 bg-[#3E2723] rounded-full" /></>
          )}
          {/* Ojos Felices: Dos arcos */}
          {eyesStyle === 'happy' && (
            <><div className="w-5 h-3 border-t-4 border-[#3E2723] rounded-t-full mt-2" /><div className="w-5 h-3 border-t-4 border-[#3E2723] rounded-t-full mt-2" /></>
          )}
          {/* Ojos Guiño: Un punto y un arco */}
          {eyesStyle === 'wink' && (
            <><div className="w-3.5 h-3.5 bg-[#3E2723] rounded-full mt-1" /><div className="w-5 h-3 border-t-4 border-[#3E2723] rounded-t-full mt-2" /></>
          )}
          {/* Ojos Redondos: Círculos blancos con pupila */}
          {eyesStyle === 'round' && (
            <>
              <div className="w-5 h-6 bg-white border-2 border-[#3E2723] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#3E2723] rounded-full" />
              </div>
              <div className="w-5 h-6 bg-white border-2 border-[#3E2723] rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-[#3E2723] rounded-full" />
              </div>
            </>
          )}
        </div>
      )}

      {/* 
        5. LA BOCA (Renderizado Condicional):
        - Solo se dibuja si 'mouthStyle' NO es igual a 'none'.
        - 'absolute top-[48%]': La coloca justo debajo de los ojos.
        - 'z-20': Asegura que esté por encima del cuerpo.
      */}
      {mouthStyle !== 'none' && (
        <div className="absolute top-[48%] z-20 flex justify-center w-full">
          {/* Boca Neutra: Una línea recta */}
          {mouthStyle === 'neutral' && <div className="w-6 h-1 bg-[#3E2723] rounded-full" />}

          {/* Boca Sonrisa: Un arco */}
          {mouthStyle === 'smile' && <div className="w-8 h-4 border-b-4 border-[#3E2723] rounded-b-full" />}

          {/* Boca Abierta: Un óvalo */}
          {mouthStyle === 'open' && <div className="w-4 h-5 bg-[#3E2723] rounded-full" />}

          {/* Boca Gatito: El símbolo :3 */}
          {mouthStyle === 'cat' && <span className="text-sm font-black text-[#3E2723] tracking-tighter mt-1">:3</span>}
        </div>
      )}

    </div>
  );
};