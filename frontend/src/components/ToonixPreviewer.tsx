import React, { useEffect, useRef } from 'react';

export type EyeStyle = 'classic' | 'cartoon' | 'wink' | 'happy' | 'angry' | 'star' | 'sleepy' | 'round';
export type MouthStyle =
  | 'neutral'
  | 'smile'
  | 'teeth'
  | 'open'
  | 'smirk'
  | 'tongue'
  | 'frown'
  | 'laugh'
  | 'whistle'
  | 'cat'
  | 'fangs'
  | 'wavy';
export type BodyPatternType = 'none' | 'stripes' | 'dots' | 'checker' | 'stars' | 'camo' | 'hearts' | 'zigzag';

interface ToonixPreviewerProps {
  spritePreviewUrl?: string | null;
  zIndex?: number;
  categoryCode?: string;
  skinColorHex?: string;
  bodyPattern?: BodyPatternType;
  eyesStyle?: EyeStyle;
  mouthStyle?: MouthStyle;
  width?: number;
  height?: number;
  showPedestal?: boolean;
}

/**
 * Renderizador de Alta Fidelidad del Maniquí Toonix Canónico (Cartoon Network Toonix)
 * Con corrección anatómica de altura de ojos (Y=205) y boca (Y=250) para evitar colisiones
 * con el contorno de la barbilla, y soporte para patrones gráficos de piel (rayas, puntos, etc.).
 */
export const ToonixPreviewer: React.FC<ToonixPreviewerProps> = ({
  spritePreviewUrl,
  zIndex = 50,
  categoryCode,
  skinColorHex = '#FFFFFF',
  bodyPattern = 'none',
  eyesStyle = 'classic',
  mouthStyle = 'neutral',
  width = 320,
  height = 320,
  showPedestal = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    const drawToonixBase = () => {
      ctx.save();
      const scale = width / 512;
      ctx.scale(scale, scale);

      // 1. Sombra / Pedestal proyectado en el suelo
      if (showPedestal) {
        ctx.beginPath();
        ctx.ellipse(256, 465, 115, 26, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(256, 463, 85, 18, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
        ctx.fill();
      }

      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';

      // =========================================================================
      // 2. CUERPO DEL AVATAR (Tronco, Brazos a los lados, Piernas cortas)
      // Definido con Path2D para recorte exacto (sin fugas de patrones fuera de la silueta)
      // =========================================================================
      const bodyPath = new Path2D();
      bodyPath.moveTo(186, 316);
      bodyPath.lineTo(162, 388);
      bodyPath.arcTo(160, 412, 182, 412, 14);
      bodyPath.arcTo(188, 412, 192, 390, 14);
      bodyPath.lineTo(192, 362);
      bodyPath.lineTo(192, 436);
      bodyPath.arcTo(192, 444, 204, 444, 8);
      bodyPath.lineTo(234, 444);
      bodyPath.arcTo(240, 444, 240, 436, 6);
      bodyPath.lineTo(240, 404);
      bodyPath.arcTo(256, 396, 272, 404, 16);
      bodyPath.lineTo(272, 404);
      bodyPath.lineTo(272, 436);
      bodyPath.arcTo(272, 444, 284, 444, 6);
      bodyPath.lineTo(320, 444);
      bodyPath.arcTo(324, 444, 324, 436, 8);
      bodyPath.lineTo(324, 362);
      bodyPath.lineTo(324, 390);
      bodyPath.arcTo(328, 412, 350, 412, 14);
      bodyPath.arcTo(352, 412, 350, 388, 14);
      bodyPath.lineTo(326, 316);
      bodyPath.closePath();

      // Relleno base de piel del cuerpo
      ctx.fillStyle = skinColorHex;
      ctx.fill(bodyPath);

      // Patrón opcional en el cuerpo (recorte estricto con bodyPath)
      if (bodyPattern && bodyPattern !== 'none') {
        ctx.save();
        ctx.clip(bodyPath);
        drawPatternOverlay(ctx, bodyPattern, 140, 316, 230, 140);
        ctx.restore();
      }

      // Trazo negro grueso icónico (siempre sobre bodyPath)
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#000000';
      ctx.stroke(bodyPath);

      // Sombra anatómica bajo la barbilla
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(188, 318);
      ctx.quadraticCurveTo(256, 354, 324, 318);
      ctx.lineTo(320, 336);
      ctx.quadraticCurveTo(256, 372, 192, 336);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.09)';
      ctx.fill();
      ctx.restore();

      // =========================================================================
      // 3. CABEZA CÚBICA REDONDEADA DEL AVATAR (144, 82, 224, 234, rx=56)
      // Límite superior: Y=82, Límite inferior: Y=316
      // Definido con Path2D para recorte exacto (sin fugas de patrones fuera de la silueta)
      // =========================================================================
      const headPath = new Path2D();
      headPath.roundRect(144, 82, 224, 234, 56);

      // Relleno base de piel de la cabeza
      ctx.fillStyle = skinColorHex;
      ctx.fill(headPath);

      // Patrón opcional en la cabeza (recorte estricto con headPath)
      if (bodyPattern && bodyPattern !== 'none') {
        ctx.save();
        ctx.clip(headPath);
        drawPatternOverlay(ctx, bodyPattern, 144, 82, 224, 234);
        ctx.restore();
      }

      // Trazo negro grueso icónico (siempre sobre headPath)
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#000000';
      ctx.stroke(headPath);

      // =========================================================================
      // 4. EXPRESIONES FACIALES (Ojos centrados en Y=205 y Boca en Y=250)
      // Se sitúan en el centro-inferior de la cabeza con amplio margen de seguridad
      // para evitar colisiones con el contorno de la barbilla (Y=316)
      // =========================================================================
      drawEyes(ctx, eyesStyle);
      drawMouth(ctx, mouthStyle);

      ctx.restore();
    };

    // Renderizado según Z-Index
    if (spritePreviewUrl && zIndex < 10) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        drawToonixBase();
      };
      img.src = spritePreviewUrl;
    } else {
      drawToonixBase();
      if (spritePreviewUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
        };
        img.src = spritePreviewUrl;
      }
    }
  }, [
    spritePreviewUrl,
    zIndex,
    categoryCode,
    skinColorHex,
    bodyPattern,
    eyesStyle,
    mouthStyle,
    width,
    height,
    showPedestal,
  ]);

  return (
    <div className="flex flex-col items-center justify-center relative">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{ position: 'relative', zIndex: 10 }}
        className="drop-shadow-md select-none"
      />
    </div>
  );
};

// =============================================================================
// MOTOR DE PATRONES DE PIEL TOONIX (Rayas, Puntos, Cuadros, Estrellas, etc.)
// =============================================================================
function drawPatternOverlay(
  ctx: CanvasRenderingContext2D,
  pattern: BodyPatternType,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();
  switch (pattern) {
    case 'stripes': {
      // Rayas horizontales elegantes
      ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
      const stripeH = 18;
      for (let py = y; py < y + h; py += stripeH * 2) {
        ctx.fillRect(x - 20, py, w + 40, stripeH);
      }
      break;
    }
    case 'dots': {
      // Lunares / Polka dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      const radius = 9;
      const step = 28;
      for (let py = y + 10; py < y + h; py += step) {
        for (let px = x + 10; px < x + w; px += step) {
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'checker': {
      // Tablero de cuadros
      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      const size = 20;
      for (let py = y; py < y + h; py += size) {
        for (let px = x; px < x + w; px += size) {
          if ((Math.floor(px / size) + Math.floor(py / size)) % 2 === 0) {
            ctx.fillRect(px, py, size, size);
          }
        }
      }
      break;
    }
    case 'stars': {
      // Estrellitas dispersas
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      const step = 38;
      for (let py = y + 15; py < y + h; py += step) {
        for (let px = x + 15; px < x + w; px += step) {
          drawMiniStar(ctx, px, py, 4, 8, 3.5);
        }
      }
      break;
    }
    case 'camo': {
      // Manchas de camuflaje urbano suave
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      const step = 42;
      for (let py = y + 12; py < y + h; py += step) {
        for (let px = x + 12; px < x + w; px += step) {
          ctx.beginPath();
          ctx.ellipse(px, py, 18, 11, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(px + 12, py + 8, 10, 14, -Math.PI / 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
    case 'hearts': {
      // Corazoncitos
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      const step = 36;
      for (let py = y + 14; py < y + h; py += step) {
        for (let px = x + 14; px < x + w; px += step) {
          drawMiniHeart(ctx, px, py, 14);
        }
      }
      break;
    }
    case 'zigzag': {
      // Ondas / Zigzag
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.16)';
      ctx.lineWidth = 6;
      const stepY = 24;
      const stepX = 16;
      for (let py = y; py < y + h; py += stepY) {
        ctx.beginPath();
        ctx.moveTo(x - 20, py);
        for (let px = x - 20; px < x + w + 20; px += stepX * 2) {
          ctx.lineTo(px + stepX, py + 10);
          ctx.lineTo(px + stepX * 2, py);
        }
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function drawMiniStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
}

function drawMiniHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);
  ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + (size + topCurveHeight) / 2, x, y + size);
  ctx.bezierCurveTo(x, y + (size + topCurveHeight) / 2, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.closePath();
  ctx.fill();
}

// =============================================================================
// MOTOR DE OJOS TOONIX ESTILO MII (Posición anatómica equilibrada: Y=205)
// =============================================================================
function drawEyes(ctx: CanvasRenderingContext2D, style: EyeStyle) {
  ctx.save();
  const leftX = 196;
  const rightX = 316;
  const eyeY = 205; // Subido para evitar choque con la barbilla y permitir boca cómoda

  switch (style) {
    case 'classic': // Dos puntitos negros puros
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(leftX, eyeY, 8.5, 0, Math.PI * 2);
      ctx.arc(rightX, eyeY, 8.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'cartoon': // Ojos ovalados negros con brillo blanco superior
      // Ojo izquierdo
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(leftX, eyeY, 11, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(leftX - 3, eyeY - 5, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Ojo derecho
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(rightX, eyeY, 11, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(rightX - 3, eyeY - 5, 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'wink': // Guiño pícaro ;)
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(leftX, eyeY, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(rightX, eyeY + 2, 11, 1.1 * Math.PI, 1.9 * Math.PI);
      ctx.stroke();
      break;

    case 'happy': // Arcos sonrientes felices (^ ^)
      ctx.lineWidth = 6.5;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(leftX, eyeY + 3, 11, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rightX, eyeY + 3, 11, 1.15 * Math.PI, 1.85 * Math.PI);
      ctx.stroke();
      break;

    case 'angry': // Ceño fruncido determinado estilo Mii
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      // Cejas
      ctx.beginPath();
      ctx.moveTo(leftX - 12, eyeY - 14);
      ctx.lineTo(leftX + 12, eyeY - 6);
      ctx.moveTo(rightX + 12, eyeY - 14);
      ctx.lineTo(rightX - 12, eyeY - 6);
      ctx.stroke();
      // Ojos
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(leftX, eyeY, 7.5, 0, Math.PI * 2);
      ctx.arc(rightX, eyeY, 7.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'star': // Ojos de estrella brillante
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      drawStar(ctx, leftX, eyeY, 5, 13, 6.5);
      drawStar(ctx, rightX, eyeY, 5, 13, 6.5);
      break;

    case 'sleepy': // Ojos dormilones / líneas neutras (- -)
      ctx.lineWidth = 6.5;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(leftX - 10, eyeY);
      ctx.lineTo(leftX + 10, eyeY);
      ctx.moveTo(rightX - 10, eyeY);
      ctx.lineTo(rightX + 10, eyeY);
      ctx.stroke();
      break;

    case 'round': // Ojos redondos abiertos con pupila centrada
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(leftX, eyeY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(rightX, eyeY, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(leftX, eyeY, 5.5, 0, Math.PI * 2);
      ctx.arc(rightX, eyeY, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
  }
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// =============================================================================
// MOTOR DE BOCAS TOONIX ESTILO MII / CARTOON NETWORK (Posición equilibrada: Y=250)
// Con 66px de separación segura respecto al contorno inferior de la cabeza (Y=316)
// =============================================================================
function drawMouth(ctx: CanvasRenderingContext2D, style: MouthStyle) {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const mouthY = 250; // Posición elevada cómoda

  switch (style) {
    case 'neutral': // Línea clásica Toonix
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(206, mouthY);
      ctx.quadraticCurveTo(256, mouthY + 5, 306, mouthY);
      ctx.stroke();
      break;

    case 'smile': // Sonrisa alegre clásica
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY - 10, 36, 0.22 * Math.PI, 0.78 * Math.PI);
      ctx.stroke();
      break;

    case 'teeth': // Sonrisa con dientes visible
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.roundRect(224, mouthY - 4, 64, 18, 6);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(245, mouthY - 3);
      ctx.lineTo(245, mouthY + 13);
      ctx.moveTo(267, mouthY - 3);
      ctx.lineTo(267, mouthY + 13);
      ctx.lineWidth = 3;
      ctx.stroke();
      break;

    case 'open': // Boca abierta redonda de sorpresa
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(256, mouthY + 2, 14, 17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#EF4444'; // Lengua
      ctx.beginPath();
      ctx.ellipse(256, mouthY + 9, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'smirk': // Sonrisa de medio lado pícara
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(225, mouthY + 4);
      ctx.quadraticCurveTo(256, mouthY + 8, 298, mouthY - 8);
      ctx.stroke();
      break;

    case 'tongue': // Lengua afuera graciosa
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY - 6, 28, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();

      // Lengüita rosada
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.roundRect(248, mouthY + 10, 16, 16, [0, 0, 8, 8]);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.stroke();
      break;

    case 'frown': // Boca disgustada / seria
      ctx.lineWidth = 7;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY + 28, 28, 1.25 * Math.PI, 1.75 * Math.PI);
      ctx.stroke();
      break;

    case 'laugh': // Carcajada abierta con lengua
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY - 4, 32, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.closePath();
      ctx.fill();
      // Lengua
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(256, mouthY + 16, 16, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.fill();
      break;

    case 'whistle': // Silbido / Besito / Círculo pequeño
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY, 9, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'cat': // Boca de gatito / :3
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(244, mouthY - 2, 12, 0.2 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(268, mouthY - 2, 12, 0.1 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      break;

    case 'fangs': // Sonrisa con colmillos de vampiro
      ctx.fillStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.arc(256, mouthY - 6, 30, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.closePath();
      ctx.fill();
      // Colmillos blancos
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.moveTo(238, mouthY + 4);
      ctx.lineTo(244, mouthY + 18);
      ctx.lineTo(250, mouthY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(262, mouthY + 4);
      ctx.lineTo(268, mouthY + 18);
      ctx.lineTo(274, mouthY + 4);
      ctx.closePath();
      ctx.fill();
      break;

    case 'wavy': // Boca ondulada / preocupada / tímida ~
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(226, mouthY);
      ctx.quadraticCurveTo(240, mouthY - 8, 256, mouthY);
      ctx.quadraticCurveTo(272, mouthY + 8, 286, mouthY);
      ctx.stroke();
      break;
  }
  ctx.restore();
}
