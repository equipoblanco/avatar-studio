import { Asset, Category, CatalogAsset } from '../types/catalog';
import { IncompatibilityRule } from '../types/incompatibility';
import { OutfitResponseDto, OutfitManifestDto } from '../types/outfit';

// Generador de sprites SVG nítidos Toonix con canal alfa y transparencia (512x512)
const makeSvgSprite = (svgContent: string): string => {
  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">${svgContent}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(fullSvg)}`;
};

// Sprites SVG canónicos Toonix con canal alfa y proporción fiel a Cartoon Network
const SPRITE_BASE_WHITE = makeSvgSprite(`
  <ellipse cx="256" cy="465" rx="115" ry="26" fill="rgba(0,0,0,0.16)"/>
  <!-- Cuerpo con brazos y piernas Toonix -->
  <path d="M 186 316 L 162 388 Q 160 412 182 412 Q 188 412 192 390 L 192 436 Q 192 444 204 444 L 234 444 Q 240 444 240 436 L 240 404 Q 256 396 272 404 L 272 436 Q 272 444 284 444 L 320 444 Q 324 444 324 436 L 324 390 Q 328 412 350 412 Q 352 412 350 388 L 326 316 Z" fill="#FFFFFF" stroke="#000000" stroke-width="14" stroke-linejoin="round"/>
  <!-- Sombra de barbilla -->
  <path d="M 188 318 Q 256 354 324 318 L 320 336 Q 256 372 192 336 Z" fill="rgba(0,0,0,0.09)"/>
  <!-- Cabeza Cúbica Redondeada -->
  <rect x="144" y="82" width="224" height="234" rx="56" fill="#FFFFFF" stroke="#000000" stroke-width="14"/>
  <!-- Ojos y boca Toonix bajos -->
  <circle cx="196" cy="270" r="8.5" fill="#000000"/>
  <circle cx="316" cy="270" r="8.5" fill="#000000"/>
  <path d="M 206 295 Q 256 300 306 295" fill="none" stroke="#000000" stroke-width="7" stroke-linecap="round"/>
`);

const SPRITE_FEET_BARE = makeSvgSprite(`
  <ellipse cx="214" cy="442" rx="20" ry="10" fill="#FFFFFF" stroke="#000000" stroke-width="8"/>
  <ellipse cx="298" cy="442" rx="20" ry="10" fill="#FFFFFF" stroke="#000000" stroke-width="8"/>
`);

const SPRITE_SHORTS_BLUE = makeSvgSprite(`
  <path d="M 188 358 L 324 358 L 324 415 L 275 415 L 256 385 L 237 415 L 188 415 Z" fill="#2563EB" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_FACE_HAPPY = makeSvgSprite(`
  <circle cx="196" cy="270" r="8.5" fill="#000000"/>
  <circle cx="316" cy="270" r="8.5" fill="#000000"/>
  <path d="M 215 288 Q 256 325 297 288" fill="none" stroke="#000000" stroke-width="7" stroke-linecap="round"/>
`);

const SPRITE_HOODIE_CYAN = makeSvgSprite(`
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 385 L 324 385 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#06B6D4" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <circle cx="256" cy="345" r="7" fill="#FFFFFF"/>
`);

const SPRITE_EMPTY = makeSvgSprite(``);

const SPRITE_WIZARD_HAT = makeSvgSprite(`
  <!-- Sombrero de Mago Grande Toonix (Colisiona con peinados voluminosos) ajustado a Y=84 -->
  <ellipse cx="256" cy="84" rx="146" ry="22" fill="#6366F1" stroke="#000000" stroke-width="12"/>
  <polygon points="172,82 256,-30 340,82" fill="#4F46E5" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <polygon points="256,16 264,31 280,31 268,42 272,58 256,48 240,58 244,42 232,31 248,31" fill="#FBBF24"/>
`);

const SPRITE_AFRO_HAIR = makeSvgSprite(`
  <!-- Peinado Afro Voluminoso Toonix (Colisiona con sombrero) -->
  <circle cx="256" cy="75" r="78" fill="#1C1917" stroke="#000000" stroke-width="12"/>
  <circle cx="165" cy="100" r="54" fill="#1C1917" stroke="#000000" stroke-width="10"/>
  <circle cx="347" cy="100" r="54" fill="#1C1917" stroke="#000000" stroke-width="10"/>
  <circle cx="256" cy="30" r="50" fill="#292524"/>
`);

// --- ACCESORIOS DE CABEZA (GORRAS, GORROS, CORONAS) ALINEADOS A LA CURVATURA DE LA CABEZA (144, 82, 224, 234, rx=56) ---
const SPRITE_CAP_BLACK = makeSvgSprite(`
  <!-- Gorra Urbana Negra ajustada a la curvatura craneal Y=82 -->
  <path d="M 142 118 C 142 56 195 48 256 48 C 317 48 370 56 370 118 C 330 96 182 96 142 118 Z" fill="#18181B" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 230 100 Q 320 98 392 114 Q 340 128 230 108 Z" fill="#27272A" stroke="#000000" stroke-width="10"/>
`);

const SPRITE_CAP_BLUE_SKATE = makeSvgSprite(`
  <!-- Gorra Skate Visera Plana Azul ajustada a la curvatura craneal Y=82 -->
  <path d="M 142 118 C 142 56 195 48 256 48 C 317 48 370 56 370 118 C 330 96 182 96 142 118 Z" fill="#2563EB" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 230 100 Q 320 98 392 114 Q 340 128 230 108 Z" fill="#1D4ED8" stroke="#000000" stroke-width="10"/>
  <circle cx="256" cy="72" r="6" fill="#FFFFFF"/>
`);

const SPRITE_HAIR_BEANIE_RED = makeSvgSprite(`
  <!-- Gorro Beanie Invernal Rojo ajustado al contorno superior Y=82 -->
  <circle cx="256" cy="30" r="20" fill="#FFFFFF" stroke="#000000" stroke-width="8"/>
  <path d="M 142 112 C 142 46 190 42 256 42 C 322 42 370 46 370 112 Z" fill="#DC2626" stroke="#000000" stroke-width="12"/>
  <rect x="140" y="94" width="232" height="26" rx="10" fill="#991B1B" stroke="#000000" stroke-width="9"/>
`);

const SPRITE_ACC_GOLD_CROWN = makeSvgSprite(`
  <!-- Corona Real Dorada apoyada con exactitud sobre el tope plano del cráneo Y=82 -->
  <path d="M 178 84 L 186 44 L 220 66 L 256 30 L 292 66 L 326 44 L 334 84 Z" fill="#FACC15" stroke="#000000" stroke-width="11" stroke-linejoin="round"/>
  <circle cx="256" cy="30" r="7" fill="#EF4444" stroke="#000000" stroke-width="3"/>
  <circle cx="186" cy="44" r="5" fill="#3B82F6" stroke="#000000" stroke-width="2"/>
  <circle cx="326" cy="44" r="5" fill="#10B981" stroke="#000000" stroke-width="2"/>
  <path d="M 178 84 Q 256 88 334 84" stroke="#D97706" stroke-width="5" fill="none"/>
`);

const SPRITE_ACC_SILVER_BLUE_CROWN = makeSvgSprite(`
  <!-- Corona Real Plateada y Azul con zafiros sobre el tope del cráneo Y=82 -->
  <path d="M 178 84 L 186 44 L 220 66 L 256 30 L 292 66 L 326 44 L 334 84 Z" fill="#E2E8F0" stroke="#000000" stroke-width="11" stroke-linejoin="round"/>
  <circle cx="256" cy="30" r="7" fill="#2563EB" stroke="#000000" stroke-width="3"/>
  <circle cx="186" cy="44" r="5" fill="#06B6D4" stroke="#000000" stroke-width="2"/>
  <circle cx="326" cy="44" r="5" fill="#06B6D4" stroke="#000000" stroke-width="2"/>
  <path d="M 178 84 Q 256 88 334 84" stroke="#94A3B8" stroke-width="5" fill="none"/>
`);

// --- PEINADOS DE HOMBRE Y MUJER EN VARIOS COLORES (SOLO CABELLOS) ---
const SPRITE_HAIR_SHORT_BLACK = makeSvgSprite(`
  <!-- Cabello Corto Hombre Negro -->
  <path d="M 148 112 C 146 54 366 54 364 112 C 340 96 256 90 148 112 Z" fill="#18181B" stroke="#000000" stroke-width="12"/>
`);

const SPRITE_HAIR_ANIME_BLONDE = makeSvgSprite(`
  <!-- Cabello Anime Puntas Rubio -->
  <path d="M 148 102 L 132 50 L 175 75 L 210 28 L 256 68 L 302 28 L 337 75 L 380 50 L 364 102 Q 256 60 148 102 Z" fill="#FACC15" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 195 78 L 218 52 L 235 82 L 256 46 L 277 82 L 294 52 L 317 78" fill="#FDE047" stroke="#000000" stroke-width="6"/>
`);

const SPRITE_HAIR_ANIME_BLUE = makeSvgSprite(`
  <!-- Cabello Anime Puntas Azul Eléctrico -->
  <path d="M 148 102 L 132 50 L 175 75 L 210 28 L 256 68 L 302 28 L 337 75 L 380 50 L 364 102 Q 256 60 148 102 Z" fill="#0284C7" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 195 78 L 218 52 L 235 82 L 256 46 L 277 82 L 294 52 L 317 78" fill="#38BDF8" stroke="#000000" stroke-width="6"/>
`);

const SPRITE_HAIR_AFRO_BROWN = makeSvgSprite(`
  <!-- Peinado Afro Voluminoso Castaño -->
  <circle cx="256" cy="75" r="78" fill="#78350F" stroke="#000000" stroke-width="12"/>
  <circle cx="165" cy="100" r="54" fill="#78350F" stroke="#000000" stroke-width="10"/>
  <circle cx="347" cy="100" r="54" fill="#78350F" stroke="#000000" stroke-width="10"/>
  <circle cx="256" cy="30" r="50" fill="#92400E"/>
`);

const SPRITE_HAIR_BROWN_EXEC = makeSvgSprite(`
  <!-- Cabello Ejecutivo Castaño Raya al lado -->
  <path d="M 148 108 C 146 56 366 56 364 108 C 340 92 290 85 240 94 C 190 103 160 102 148 108 Z" fill="#5D4037" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_HAIR_LONG_BROWN = makeSvgSprite(`
  <!-- Melena Larga Mujer Castaña -->
  <path d="M 144 110 C 142 50 370 50 368 110 L 372 260 C 372 280 348 280 344 260 L 344 140 C 300 100 212 100 168 140 L 168 260 C 164 280 140 280 140 260 Z" fill="#5D4037" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_HAIR_LONG_BLONDE = makeSvgSprite(`
  <!-- Melena Larga Mujer Rubia -->
  <path d="M 144 110 C 142 50 370 50 368 110 L 372 260 C 372 280 348 280 344 260 L 344 140 C 300 100 212 100 168 140 L 168 260 C 164 280 140 280 140 260 Z" fill="#FACC15" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_HAIR_LONG_RED = makeSvgSprite(`
  <!-- Melena Larga Mujer Pelirroja -->
  <path d="M 144 110 C 142 50 370 50 368 110 L 372 260 C 372 280 348 280 344 260 L 344 140 C 300 100 212 100 168 140 L 168 260 C 164 280 140 280 140 260 Z" fill="#DC2626" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_HAIR_TOP_BUN = makeSvgSprite(`
  <!-- Moño Superior Bun Chic Negro con diadema fucsia -->
  <circle cx="256" cy="46" r="36" fill="#1C1917" stroke="#000000" stroke-width="11"/>
  <rect x="238" y="70" width="36" height="12" rx="4" fill="#F43F5E" stroke="#000000" stroke-width="5"/>
  <path d="M 144 116 C 144 68 190 64 256 64 C 322 64 368 68 368 116 C 330 96 182 96 144 116 Z" fill="#292524" stroke="#000000" stroke-width="11"/>
`);

const SPRITE_HAIR_BOB_PINK = makeSvgSprite(`
  <!-- Corte Bob Moderno Rosa Fucsia -->
  <path d="M 144 105 C 142 45 370 45 368 105 L 370 210 L 345 210 C 340 130 310 110 256 110 C 202 110 172 130 167 210 L 142 210 Z" fill="#F472B6" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

const SPRITE_HAIR_WAVY_PURPLE = makeSvgSprite(`
  <!-- Cabello Ondulado Violeta -->
  <path d="M 146 100 C 144 48 368 48 366 100 L 375 190 Q 355 210 345 190 Q 335 170 325 190 L 325 130 Q 256 100 187 130 L 187 190 Q 177 170 167 190 Q 157 210 137 190 Z" fill="#8B5CF6" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
`);

// --- NUEVO CALZADO ---
const SPRITE_SHOES_RED_SNEAKERS = makeSvgSprite(`
  <!-- Sneakers Urbanos Rojos con suela blanca -->
  <rect x="186" y="426" width="56" height="22" rx="7" fill="#EF4444" stroke="#000000" stroke-width="8"/>
  <rect x="184" y="440" width="60" height="10" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
  <rect x="270" y="426" width="56" height="22" rx="7" fill="#EF4444" stroke="#000000" stroke-width="8"/>
  <rect x="268" y="440" width="60" height="10" rx="3" fill="#FFFFFF" stroke="#000000" stroke-width="6"/>
`);

const SPRITE_SHOES_BLACK_BOOTS = makeSvgSprite(`
  <!-- Botas Militares de Cuero Negras -->
  <rect x="184" y="418" width="58" height="32" rx="8" fill="#18181B" stroke="#000000" stroke-width="9"/>
  <rect x="270" y="418" width="58" height="32" rx="8" fill="#18181B" stroke="#000000" stroke-width="9"/>
  <line x1="192" y1="432" x2="234" y2="432" stroke="#E4E4E7" stroke-width="4"/>
  <line x1="278" y1="432" x2="320" y2="432" stroke="#E4E4E7" stroke-width="4"/>
`);

const SPRITE_SHOES_GREEN_RUNNERS = makeSvgSprite(`
  <!-- Zapatillas Deportivas Verde Neón -->
  <ellipse cx="214" cy="438" rx="28" ry="12" fill="#84CC16" stroke="#000000" stroke-width="8"/>
  <ellipse cx="298" cy="438" rx="28" ry="12" fill="#84CC16" stroke="#000000" stroke-width="8"/>
  <path d="M 200 438 L 228 438" stroke="#FFFFFF" stroke-width="4"/>
  <path d="M 284 438 L 312 438" stroke="#FFFFFF" stroke-width="4"/>
`);

const SPRITE_SHOES_YELLOW_CLAWS = makeSvgSprite(`
  <!-- Pantuflas de Garra Toonix Amarillas -->
  <ellipse cx="214" cy="436" rx="30" ry="15" fill="#FACC15" stroke="#000000" stroke-width="8"/>
  <ellipse cx="298" cy="436" rx="30" ry="15" fill="#FACC15" stroke="#000000" stroke-width="8"/>
  <!-- Garras -->
  <circle cx="194" cy="444" r="5" fill="#18181B"/>
  <circle cx="214" cy="446" r="5" fill="#18181B"/>
  <circle cx="234" cy="444" r="5" fill="#18181B"/>
  <circle cx="278" cy="444" r="5" fill="#18181B"/>
  <circle cx="298" cy="446" r="5" fill="#18181B"/>
  <circle cx="318" cy="444" r="5" fill="#18181B"/>
`);

const SPRITE_SHOES_CHELSEA_BROWN = makeSvgSprite(`
  <!-- Botas Chelsea Marrones Cuero -->
  <rect x="184" y="420" width="58" height="30" rx="8" fill="#78350F" stroke="#000000" stroke-width="9"/>
  <rect x="270" y="420" width="58" height="30" rx="8" fill="#78350F" stroke="#000000" stroke-width="9"/>
  <rect x="206" y="422" width="14" height="22" rx="4" fill="#451A03"/>
  <rect x="292" y="422" width="14" height="22" rx="4" fill="#451A03"/>
`);

const SPRITE_SHOES_SANDALS_BLACK = makeSvgSprite(`
  <!-- Sandalias Playeras Negras de Verano -->
  <ellipse cx="214" cy="442" rx="28" ry="10" fill="#18181B" stroke="#000000" stroke-width="7"/>
  <ellipse cx="298" cy="442" rx="28" ry="10" fill="#18181B" stroke="#000000" stroke-width="7"/>
  <line x1="196" y1="440" x2="232" y2="440" stroke="#06B6D4" stroke-width="5" stroke-linecap="round"/>
  <line x1="280" y1="440" x2="316" y2="440" stroke="#06B6D4" stroke-width="5" stroke-linecap="round"/>
`);

const SPRITE_SHOES_SNEAKERS_WHITE = makeSvgSprite(`
  <!-- Sneakers Clásicos Blancos Minimalistas -->
  <rect x="186" y="426" width="56" height="22" rx="7" fill="#F8FAFC" stroke="#000000" stroke-width="8"/>
  <rect x="184" y="440" width="60" height="10" rx="3" fill="#E2E8F0" stroke="#000000" stroke-width="6"/>
  <rect x="270" y="426" width="56" height="22" rx="7" fill="#F8FAFC" stroke="#000000" stroke-width="8"/>
  <rect x="268" y="440" width="60" height="10" rx="3" fill="#E2E8F0" stroke="#000000" stroke-width="6"/>
  <line x1="198" y1="432" x2="228" y2="432" stroke="#3B82F6" stroke-width="3"/>
  <line x1="282" y1="432" x2="312" y2="432" stroke="#3B82F6" stroke-width="3"/>
`);

// --- NUEVA ROPA SUPERIOR ---
const SPRITE_SHIRT_STRIPED = makeSvgSprite(`
  <!-- Camiseta a Rayas Skater Blanco y Negro -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 385 L 324 385 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#FFFFFF" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="188" y1="340" x2="324" y2="340" stroke="#18181B" stroke-width="8"/>
  <line x1="188" y1="360" x2="324" y2="360" stroke="#18181B" stroke-width="8"/>
  <line x1="188" y1="380" x2="324" y2="380" stroke="#18181B" stroke-width="8"/>
`);

const SPRITE_SHIRT_RED_TEE = makeSvgSprite(`
  <!-- Camiseta Roja Clásica Toonix con logo estrella -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 385 L 324 385 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#EF4444" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <circle cx="256" cy="354" r="14" fill="#FACC15" stroke="#000000" stroke-width="4"/>
`);

const SPRITE_SHIRT_BLACK_JACKET = makeSvgSprite(`
  <!-- Chaqueta de Cuero Rockera Negra con cremallera -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 388 L 324 388 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#18181B" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="256" y1="322" x2="256" y2="388" stroke="#E4E4E7" stroke-width="6"/>
  <path d="M 230 322 L 256 348 L 282 322" fill="#E11D48" stroke="#000000" stroke-width="5"/>
`);

const SPRITE_SHIRT_HAWAIIAN = makeSvgSprite(`
  <!-- Camisa Hawaiana Amarilla Veraniega -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 385 L 324 385 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#F59E0B" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <circle cx="220" cy="350" r="7" fill="#06B6D4"/>
  <circle cx="290" cy="350" r="7" fill="#10B981"/>
  <circle cx="256" cy="370" r="6" fill="#EC4899"/>
`);

const SPRITE_SHIRT_VARSITY_BOMBER = makeSvgSprite(`
  <!-- Chaqueta Bomber Varsity Azul y Blanco -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 388 L 324 388 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#1E3A8A" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 Z" fill="#F8FAFC" stroke="#000000" stroke-width="9"/>
  <path d="M 334 322 L 360 384 Q 362 400 346 404 L 328 394 L 324 356 Z" fill="#F8FAFC" stroke="#000000" stroke-width="9"/>
  <text x="210" y="360" font-family="Arial, sans-serif" font-size="24" font-weight="900" fill="#FACC15">A</text>
  <circle cx="256" cy="342" r="4" fill="#F8FAFC"/>
  <circle cx="256" cy="362" r="4" fill="#F8FAFC"/>
  <circle cx="256" cy="382" r="4" fill="#F8FAFC"/>
`);

const SPRITE_SHIRT_NORDIC_SWEATER = makeSvgSprite(`
  <!-- Suéter Tejido Invierno Nórdico Verde Teal -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 388 L 324 388 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#0D9488" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 188 348 L 324 348" stroke="#FDE047" stroke-width="6" stroke-dasharray="10,6"/>
  <path d="M 188 368 L 324 368" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="8,5"/>
  <rect x="218" y="318" width="76" height="12" rx="4" fill="#0F766E" stroke="#000000" stroke-width="4"/>
`);

const SPRITE_SHIRT_WHITE_BASIC = makeSvgSprite(`
  <!-- Camiseta Básica Blanca Minimalista -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 385 L 324 385 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#F8FAFC" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 230 322 Q 256 338 282 322" fill="none" stroke="#CBD5E1" stroke-width="5"/>
`);

const SPRITE_SHIRT_HOODIE_GREY = makeSvgSprite(`
  <!-- Hoodie Urbano Gris con Capucha y Bolsillo -->
  <path d="M 178 322 L 152 384 Q 150 400 166 404 L 184 394 L 188 356 L 188 388 L 324 388 L 324 356 L 328 394 L 346 404 Q 362 400 360 384 L 334 322 Z" fill="#475569" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 216 388 L 224 364 L 288 364 L 296 388 Z" fill="#334155" stroke="#000000" stroke-width="6"/>
  <line x1="246" y1="324" x2="246" y2="348" stroke="#F1F5F9" stroke-width="4" stroke-linecap="round"/>
  <line x1="266" y1="324" x2="266" y2="348" stroke="#F1F5F9" stroke-width="4" stroke-linecap="round"/>
`);

// --- NUEVA ROPA INFERIOR ---
const SPRITE_PANTS_JEANS_DENIM = makeSvgSprite(`
  <!-- Jeans Vaqueros Denim Clásicos -->
  <path d="M 188 358 L 324 358 L 324 430 L 272 430 L 256 396 L 240 430 L 188 430 Z" fill="#1D4ED8" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="256" y1="358" x2="256" y2="396" stroke="#93C5FD" stroke-width="4"/>
  <line x1="194" y1="422" x2="234" y2="422" stroke="#BFDBFE" stroke-width="5"/>
  <line x1="278" y1="422" x2="318" y2="422" stroke="#BFDBFE" stroke-width="5"/>
`);

const SPRITE_PANTS_JOGGERS_BLACK = makeSvgSprite(`
  <!-- Joggers Deportivos Negros con banda blanca -->
  <path d="M 188 358 L 324 358 L 324 430 L 272 430 L 256 396 L 240 430 L 188 430 Z" fill="#18181B" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="192" y1="360" x2="192" y2="430" stroke="#FFFFFF" stroke-width="6"/>
  <line x1="320" y1="360" x2="320" y2="430" stroke="#FFFFFF" stroke-width="6"/>
`);

const SPRITE_PANTS_CARGO_GREEN = makeSvgSprite(`
  <!-- Bermudas Cargo Verde Militar -->
  <path d="M 188 358 L 324 358 L 324 418 L 275 418 L 256 385 L 237 418 L 188 418 Z" fill="#3F6212" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <rect x="184" y="380" width="16" height="24" rx="4" fill="#4D7C0F" stroke="#000000" stroke-width="5"/>
  <rect x="312" y="380" width="16" height="24" rx="4" fill="#4D7C0F" stroke="#000000" stroke-width="5"/>
`);

const SPRITE_PANTS_CARGO_BLACK = makeSvgSprite(`
  <!-- Pantalón Cargo Negro Táctico con Bolsillos -->
  <path d="M 188 358 L 324 358 L 324 430 L 272 430 L 256 396 L 240 430 L 188 430 Z" fill="#18181B" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <rect x="182" y="386" width="16" height="26" rx="4" fill="#27272A" stroke="#000000" stroke-width="5"/>
  <rect x="314" y="386" width="16" height="26" rx="4" fill="#27272A" stroke="#000000" stroke-width="5"/>
`);

const SPRITE_PANTS_TENNIS_SKIRT = makeSvgSprite(`
  <!-- Falda Tenis Blanca Plisada -->
  <polygon points="196,358 316,358 336,412 176,412" fill="#F8FAFC" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="216" y1="358" x2="208" y2="412" stroke="#CBD5E1" stroke-width="5"/>
  <line x1="256" y1="358" x2="256" y2="412" stroke="#CBD5E1" stroke-width="5"/>
  <line x1="296" y1="358" x2="304" y2="412" stroke="#CBD5E1" stroke-width="5"/>
`);

const SPRITE_PANTS_SHORTS_DENIM = makeSvgSprite(`
  <!-- Shorts Denim Desgastados Verano -->
  <path d="M 188 358 L 324 358 L 324 412 L 275 412 L 256 385 L 237 412 L 188 412 Z" fill="#3B82F6" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="200" y1="395" x2="225" y2="395" stroke="#BFDBFE" stroke-width="4"/>
  <line x1="285" y1="395" x2="310" y2="395" stroke="#BFDBFE" stroke-width="4"/>
`);

const SPRITE_PANTS_SKIRT_RED = makeSvgSprite(`
  <!-- Falda Tableada Escocesa Roja -->
  <polygon points="196,358 316,358 334,412 178,412" fill="#DC2626" stroke="#000000" stroke-width="12" stroke-linejoin="round"/>
  <line x1="216" y1="358" x2="208" y2="412" stroke="#18181B" stroke-width="4"/>
  <line x1="256" y1="358" x2="256" y2="412" stroke="#18181B" stroke-width="4"/>
  <line x1="296" y1="358" x2="304" y2="412" stroke="#18181B" stroke-width="4"/>
`);

// --- NUEVOS ACCESORIOS ---
const SPRITE_ACC_SUNGLASSES = makeSvgSprite(`
  <!-- Gafas de Sol Negras Wayfarer (Centradas a la altura de los ojos Y=205) -->
  <rect x="176" y="192" width="64" height="34" rx="8" fill="#18181B" stroke="#000000" stroke-width="8"/>
  <rect x="272" y="192" width="64" height="34" rx="8" fill="#18181B" stroke="#000000" stroke-width="8"/>
  <line x1="240" y1="202" x2="272" y2="202" stroke="#18181B" stroke-width="8"/>
  <line x1="144" y1="200" x2="176" y2="202" stroke="#18181B" stroke-width="6"/>
  <line x1="336" y1="202" x2="368" y2="200" stroke="#18181B" stroke-width="6"/>
`);

const SPRITE_ACC_GAMER_HEADSET = makeSvgSprite(`
  <!-- Auriculares Gamer RGB ajustados a la curvatura anatómica superior e inferior -->
  <path d="M 140 160 C 140 68 190 62 256 62 C 322 62 372 68 372 160" fill="none" stroke="#18181B" stroke-width="14" stroke-linecap="round"/>
  <path d="M 170 70 C 210 65 302 65 342 70" fill="none" stroke="#06B6D4" stroke-width="4"/>
  <rect x="126" y="150" width="24" height="60" rx="10" fill="#06B6D4" stroke="#000000" stroke-width="8"/>
  <rect x="362" y="150" width="24" height="60" rx="10" fill="#06B6D4" stroke="#000000" stroke-width="8"/>
  <path d="M 140 200 Q 180 240 220 238" fill="none" stroke="#18181B" stroke-width="6"/>
  <circle cx="223" cy="237" r="7" fill="#F43F5E"/>
`);

const SPRITE_ACC_SCARF_RED = makeSvgSprite(`
  <!-- Bufanda Roja Abrigada en el cuello -->
  <path d="M 180 308 Q 256 328 332 308 Q 320 338 256 342 Q 192 338 180 308 Z" fill="#DC2626" stroke="#000000" stroke-width="10"/>
  <rect x="264" y="328" width="24" height="52" rx="6" fill="#B91C1C" stroke="#000000" stroke-width="6"/>
`);

const SPRITE_ACC_MUSTACHE = makeSvgSprite(`
  <!-- Bigote Clásico Negro Caballero (centrado en Y=234 entre ojos y boca) -->
  <path d="M 256 238 C 242 226 216 226 200 242 C 220 246 242 240 256 248 C 270 240 292 246 312 242 C 296 226 270 226 256 238 Z" fill="#18181B" stroke="#000000" stroke-width="6"/>
`);

const SPRITE_ACC_DRAGON_WINGS = makeSvgSprite(`
  <!-- Alas de Dragón Púrpuras traseras -->
  <path d="M 186 330 L 100 240 L 130 310 L 80 320 L 140 370 L 186 360 Z" fill="#7C3AED" stroke="#000000" stroke-width="10" stroke-linejoin="round"/>
  <path d="M 326 330 L 412 240 L 382 310 L 432 320 L 372 370 L 326 360 Z" fill="#7C3AED" stroke="#000000" stroke-width="10" stroke-linejoin="round"/>
`);

export const INITIAL_CATEGORIES: Category[] = [
  { id: 1, code: 'cuerpo_base',   name: 'Cuerpo',           zIndexDefault: 10, defaultAssetId: 1, defaultAssetName: 'Base Blanco Neutro', defaultAssetSpriteUrl: SPRITE_BASE_WHITE, isRequired: true },
  { id: 2, code: 'calzado',       name: 'Zapatos',          zIndexDefault: 20, defaultAssetId: 2, defaultAssetName: 'Pies Descalzos', defaultAssetSpriteUrl: SPRITE_FEET_BARE, isRequired: false },
  { id: 3, code: 'ropa_inferior', name: 'Inferior',         zIndexDefault: 25, defaultAssetId: 3, defaultAssetName: 'Short Básico Azul', defaultAssetSpriteUrl: SPRITE_SHORTS_BLUE, isRequired: false },
  { id: 4, code: 'rostro',        name: 'Rostro',           zIndexDefault: 40, defaultAssetId: 4, defaultAssetName: 'Expresión Feliz Clásica', defaultAssetSpriteUrl: SPRITE_FACE_HAPPY, isRequired: true },
  { id: 5, code: 'ropa_superior', name: 'Superior',         zIndexDefault: 35, defaultAssetId: null, defaultAssetName: null, defaultAssetSpriteUrl: null, isRequired: false },
  { id: 6, code: 'accesorios',    name: 'Accesorios',       zIndexDefault: 70, defaultAssetId: null, defaultAssetName: null, defaultAssetSpriteUrl: null, isRequired: false },
  { id: 7, code: 'peinado',       name: 'Cabello',          zIndexDefault: 50, defaultAssetId: null, defaultAssetName: null, defaultAssetSpriteUrl: null, isRequired: false },
];

export const INITIAL_ASSETS: Asset[] = [
  { id: 1, categoryId: 1, categoryCode: 'cuerpo_base',   categoryName: 'Cuerpo',           name: 'Base Blanco Neutro',         spriteUrl: SPRITE_BASE_WHITE, thumbnailUrl: SPRITE_BASE_WHITE, zIndex: 10, tags: ['base', 'avatar', 'blanco'], status: 'ACTIVE', isDefault: true, supportsTint: true, obtainable: false, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 2, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Pies Descalzos',             spriteUrl: SPRITE_FEET_BARE, thumbnailUrl: SPRITE_FEET_BARE, zIndex: 20, tags: ['pies', 'descalzo'],           status: 'ACTIVE', isDefault: true, supportsTint: true, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 3, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Short Básico Azul',          spriteUrl: SPRITE_SHORTS_BLUE, thumbnailUrl: SPRITE_SHORTS_BLUE, zIndex: 25, tags: ['short', 'azul', 'inferior'], status: 'ACTIVE', isDefault: true, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 4, categoryId: 4, categoryCode: 'rostro',        categoryName: 'Rostro',           name: 'Expresión Feliz Clásica',    spriteUrl: SPRITE_FACE_HAPPY, thumbnailUrl: SPRITE_FACE_HAPPY, zIndex: 40, tags: ['rostro', 'feliz', 'ojos'],    status: 'ACTIVE', isDefault: true, supportsTint: false, obtainable: false, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // --- PEINADOS (SOLO CABELLOS - Z-INDEX: 50 ESTRICTO DIRECTO SOBRE CABEZA) ---
  { id: 110, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Corto Negro',        spriteUrl: SPRITE_HAIR_SHORT_BLACK, thumbnailUrl: SPRITE_HAIR_SHORT_BLACK, zIndex: 50, tags: ['corto', 'hombre', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 14,  categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Corto Castaño',      spriteUrl: SPRITE_HAIR_BROWN_EXEC, thumbnailUrl: SPRITE_HAIR_BROWN_EXEC, zIndex: 50, tags: ['ejecutivo', 'castaño', 'peinado'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 12,  categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Anime Rubio',        spriteUrl: SPRITE_HAIR_ANIME_BLONDE, thumbnailUrl: SPRITE_HAIR_ANIME_BLONDE, zIndex: 50, tags: ['anime', 'puntas', 'rubio'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 111, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Anime Azul',         spriteUrl: SPRITE_HAIR_ANIME_BLUE, thumbnailUrl: SPRITE_HAIR_ANIME_BLUE, zIndex: 50, tags: ['anime', 'azul', 'electrico'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 11,  categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Afro Negro',         spriteUrl: SPRITE_AFRO_HAIR, thumbnailUrl: SPRITE_AFRO_HAIR, zIndex: 50, tags: ['afro', 'voluminoso', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 112, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Afro Castaño',       spriteUrl: SPRITE_HAIR_AFRO_BROWN, thumbnailUrl: SPRITE_HAIR_AFRO_BROWN, zIndex: 50, tags: ['afro', 'voluminoso', 'castaño'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 113, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Melena Larga Castaña',       spriteUrl: SPRITE_HAIR_LONG_BROWN, thumbnailUrl: SPRITE_HAIR_LONG_BROWN, zIndex: 50, tags: ['melena', 'larga', 'mujer', 'castaño'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 114, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Melena Larga Rubia',         spriteUrl: SPRITE_HAIR_LONG_BLONDE, thumbnailUrl: SPRITE_HAIR_LONG_BLONDE, zIndex: 50, tags: ['melena', 'larga', 'mujer', 'rubio'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 115, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Melena Larga Pelirroja',     spriteUrl: SPRITE_HAIR_LONG_RED, thumbnailUrl: SPRITE_HAIR_LONG_RED, zIndex: 50, tags: ['melena', 'larga', 'mujer', 'pelirrojo'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 15,  categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Moño Bun Chic Negro',        spriteUrl: SPRITE_HAIR_TOP_BUN, thumbnailUrl: SPRITE_HAIR_TOP_BUN, zIndex: 50, tags: ['moño', 'bun', 'chic', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 117, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Corte Bob Rosa',             spriteUrl: SPRITE_HAIR_BOB_PINK, thumbnailUrl: SPRITE_HAIR_BOB_PINK, zIndex: 50, tags: ['bob', 'rosa', 'mujer'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 118, categoryId: 7, categoryCode: 'peinado',     categoryName: 'Cabello',          name: 'Cabello Ondulado Violeta',   spriteUrl: SPRITE_HAIR_WAVY_PURPLE, thumbnailUrl: SPRITE_HAIR_WAVY_PURPLE, zIndex: 50, tags: ['ondulado', 'violeta'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // --- CALZADO (Z-INDEX: 20) ---
  { id: 20, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Sneakers Urbanos Rojos',     spriteUrl: SPRITE_SHOES_RED_SNEAKERS, thumbnailUrl: SPRITE_SHOES_RED_SNEAKERS, zIndex: 20, tags: ['sneakers', 'zapatillas', 'rojo', 'urbano'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 21, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Botas Militares de Cuero',   spriteUrl: SPRITE_SHOES_BLACK_BOOTS, thumbnailUrl: SPRITE_SHOES_BLACK_BOOTS, zIndex: 20, tags: ['botas', 'cuero', 'negro', 'militar'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 22, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Zapatillas Deportivas Neón', spriteUrl: SPRITE_SHOES_GREEN_RUNNERS, thumbnailUrl: SPRITE_SHOES_GREEN_RUNNERS, zIndex: 20, tags: ['deportivas', 'verde', 'neon'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 23, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Pantuflas de Garra',         spriteUrl: SPRITE_SHOES_YELLOW_CLAWS, thumbnailUrl: SPRITE_SHOES_YELLOW_CLAWS, zIndex: 20, tags: ['pantuflas', 'garra', 'amarillo'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 24, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Botas Chelsea Marrones',     spriteUrl: SPRITE_SHOES_CHELSEA_BROWN, thumbnailUrl: SPRITE_SHOES_CHELSEA_BROWN, zIndex: 20, tags: ['botas', 'chelsea', 'cuero', 'marron'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 25, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Sandalias Playeras Negras',  spriteUrl: SPRITE_SHOES_SANDALS_BLACK, thumbnailUrl: SPRITE_SHOES_SANDALS_BLACK, zIndex: 20, tags: ['sandalias', 'playeras', 'verano'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 26, categoryId: 2, categoryCode: 'calzado',       categoryName: 'Zapatos',          name: 'Sneakers Clásicos Blancos',  spriteUrl: SPRITE_SHOES_SNEAKERS_WHITE, thumbnailUrl: SPRITE_SHOES_SNEAKERS_WHITE, zIndex: 20, tags: ['sneakers', 'blanco', 'clasico'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // --- ROPA SUPERIOR (Z-INDEX: 35) ---
  { id: 9,  categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Sudadera Hoodie Cyan',       spriteUrl: SPRITE_HOODIE_CYAN, thumbnailUrl: SPRITE_HOODIE_CYAN, zIndex: 35, tags: ['sudadera', 'hoodie', 'cyan', 'invierno'], status: 'ACTIVE', isDefault: false, supportsTint: true, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 30, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Camiseta Rayas Skater',      spriteUrl: SPRITE_SHIRT_STRIPED, thumbnailUrl: SPRITE_SHIRT_STRIPED, zIndex: 35, tags: ['camiseta', 'rayas', 'skater'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 31, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Camiseta Roja Avatar',       spriteUrl: SPRITE_SHIRT_RED_TEE, thumbnailUrl: SPRITE_SHIRT_RED_TEE, zIndex: 35, tags: ['camiseta', 'rojo'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 32, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Chaqueta Cuero Rocker',      spriteUrl: SPRITE_SHIRT_BLACK_JACKET, thumbnailUrl: SPRITE_SHIRT_BLACK_JACKET, zIndex: 35, tags: ['chaqueta', 'cuero', 'rocker', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 33, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Camisa Hawaiana Amarilla',   spriteUrl: SPRITE_SHIRT_HAWAIIAN, thumbnailUrl: SPRITE_SHIRT_HAWAIIAN, zIndex: 35, tags: ['camisa', 'hawaiana', 'amarillo', 'playa'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 34, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Chaqueta Bomber Varsity',    spriteUrl: SPRITE_SHIRT_VARSITY_BOMBER, thumbnailUrl: SPRITE_SHIRT_VARSITY_BOMBER, zIndex: 35, tags: ['chaqueta', 'bomber', 'varsity', 'azul'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 35, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Suéter Tejido Nórdico',      spriteUrl: SPRITE_SHIRT_NORDIC_SWEATER, thumbnailUrl: SPRITE_SHIRT_NORDIC_SWEATER, zIndex: 35, tags: ['sueter', 'tejido', 'nordico', 'invierno'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 36, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Camiseta Básica Blanca',     spriteUrl: SPRITE_SHIRT_WHITE_BASIC, thumbnailUrl: SPRITE_SHIRT_WHITE_BASIC, zIndex: 35, tags: ['camiseta', 'blanca', 'basico'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 37, categoryId: 5, categoryCode: 'ropa_superior', categoryName: 'Superior',    name: 'Hoodie Urbano Gris',         spriteUrl: SPRITE_SHIRT_HOODIE_GREY, thumbnailUrl: SPRITE_SHIRT_HOODIE_GREY, zIndex: 35, tags: ['hoodie', 'gris', 'urbano', 'sudadera'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // --- ROPA INFERIOR (Z-INDEX: 25) ---
  { id: 40, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Jeans Vaqueros Denim',       spriteUrl: SPRITE_PANTS_JEANS_DENIM, thumbnailUrl: SPRITE_PANTS_JEANS_DENIM, zIndex: 25, tags: ['jeans', 'vaqueros', 'denim', 'azul'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 41, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Joggers Deportivos Negros',  spriteUrl: SPRITE_PANTS_JOGGERS_BLACK, thumbnailUrl: SPRITE_PANTS_JOGGERS_BLACK, zIndex: 25, tags: ['joggers', 'deportivo', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 42, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Bermudas Cargo Verde Militar', spriteUrl: SPRITE_PANTS_CARGO_GREEN, thumbnailUrl: SPRITE_PANTS_CARGO_GREEN, zIndex: 25, tags: ['cargo', 'bermudas', 'verde'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 43, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Falda Escocesa Roja',        spriteUrl: SPRITE_PANTS_SKIRT_RED, thumbnailUrl: SPRITE_PANTS_SKIRT_RED, zIndex: 25, tags: ['falda', 'escocesa', 'roja'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 44, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Pantalón Cargo Negro',       spriteUrl: SPRITE_PANTS_CARGO_BLACK, thumbnailUrl: SPRITE_PANTS_CARGO_BLACK, zIndex: 25, tags: ['cargo', 'negro', 'tactico'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 45, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Falda Tenis Blanca',         spriteUrl: SPRITE_PANTS_TENNIS_SKIRT, thumbnailUrl: SPRITE_PANTS_TENNIS_SKIRT, zIndex: 25, tags: ['falda', 'tenis', 'blanca'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 46, categoryId: 3, categoryCode: 'ropa_inferior', categoryName: 'Inferior',    name: 'Shorts Denim Desgastados',   spriteUrl: SPRITE_PANTS_SHORTS_DENIM, thumbnailUrl: SPRITE_PANTS_SHORTS_DENIM, zIndex: 25, tags: ['shorts', 'denim', 'desgastado'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // --- ACCESORIOS (ORDEN ESTRICTO: ESPALDA Z=8, FACIAL Z=52-60, CABEZA/SOMBREROS Z=70-75 SOBRE CABELLO) ---
  { id: 54, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Alas de Dragón Púrpuras',    spriteUrl: SPRITE_ACC_DRAGON_WINGS, thumbnailUrl: SPRITE_ACC_DRAGON_WINGS, zIndex: 8, tags: ['alas', 'dragon', 'purpura', 'espaldas'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 53, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Bigote Clásico Caballero',   spriteUrl: SPRITE_ACC_MUSTACHE, thumbnailUrl: SPRITE_ACC_MUSTACHE, zIndex: 52, tags: ['bigote', 'caballero', 'facial'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 50, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Gafas de Sol Wayfarer',      spriteUrl: SPRITE_ACC_SUNGLASSES, thumbnailUrl: SPRITE_ACC_SUNGLASSES, zIndex: 58, tags: ['gafas', 'sol', 'wayfarer', 'negro'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 52, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Bufanda Roja Abrigada',      spriteUrl: SPRITE_ACC_SCARF_RED, thumbnailUrl: SPRITE_ACC_SCARF_RED, zIndex: 60, tags: ['bufanda', 'rojo', 'invierno'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },

  // Sombreros, Gorras, Gorros y Coronas (Z-Index 70..75: Se renderizan estrictamente SOBRE el cabello Z=50)
  { id: 8,  categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Gorra Urbana Negra',         spriteUrl: SPRITE_CAP_BLACK, thumbnailUrl: SPRITE_CAP_BLACK, zIndex: 70, tags: ['gorra', 'urbano', 'calle', 'negro', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 57, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Gorra Skate Visera Azul',    spriteUrl: SPRITE_CAP_BLUE_SKATE, thumbnailUrl: SPRITE_CAP_BLUE_SKATE, zIndex: 70, tags: ['gorra', 'skate', 'azul', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 13, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Gorro Beanie Invernal',      spriteUrl: SPRITE_HAIR_BEANIE_RED, thumbnailUrl: SPRITE_HAIR_BEANIE_RED, zIndex: 70, tags: ['gorro', 'beanie', 'invierno', 'rojo', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 56, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Corona Real Dorada',         spriteUrl: SPRITE_ACC_GOLD_CROWN, thumbnailUrl: SPRITE_ACC_GOLD_CROWN, zIndex: 72, tags: ['corona', 'oro', 'rey', 'reina', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 58, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Corona Real Plateada y Azul', spriteUrl: SPRITE_ACC_SILVER_BLUE_CROWN, thumbnailUrl: SPRITE_ACC_SILVER_BLUE_CROWN, zIndex: 72, tags: ['corona', 'plata', 'azul', 'reina', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 10, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Sombrero de Mago Grande',    spriteUrl: SPRITE_WIZARD_HAT, thumbnailUrl: SPRITE_WIZARD_HAT, zIndex: 75, tags: ['sombrero', 'mago', 'magia', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
  { id: 51, categoryId: 6, categoryCode: 'accesorios',   categoryName: 'Accesorios',       name: 'Auriculares Gamer RGB',      spriteUrl: SPRITE_ACC_GAMER_HEADSET, thumbnailUrl: SPRITE_ACC_GAMER_HEADSET, zIndex: 75, tags: ['auriculares', 'gamer', 'headset', 'rgb', 'cabeza'], status: 'ACTIVE', isDefault: false, supportsTint: false, obtainable: true, createdAt: '2026-11-01', updatedAt: '2026-11-01' },
];

export const INITIAL_RULES: IncompatibilityRule[] = [
  {
    id: 1,
    assetAId: 8,
    assetAName: 'Gorra Urbana Negra',
    assetACategoryId: 6,
    assetACategoryName: 'Accesorios',
    assetASpriteUrl: SPRITE_CAP_BLACK,
    assetBId: 11,
    assetBName: 'Cabello Afro Negro',
    assetBCategoryId: 7,
    assetBCategoryName: 'Cabello',
    assetBSpriteUrl: SPRITE_AFRO_HAIR,
    reason: 'Colisión visual: El cabello afro voluminoso atraviesa la visera y copa de la gorra.',
    createdAt: '2026-11-01',
  },
  {
    id: 2,
    assetAId: 54,
    assetAName: 'Alas de Dragón Púrpuras',
    assetACategoryId: 6,
    assetACategoryName: 'Accesorios',
    assetASpriteUrl: SPRITE_ACC_DRAGON_WINGS,
    assetBId: 9,
    assetBName: 'Sudadera Hoodie Cyan',
    assetBCategoryId: 5,
    assetBCategoryName: 'Ropa superior',
    assetBSpriteUrl: SPRITE_HOODIE_CYAN,
    reason: 'Colisión visual: La capucha abultada se superpone con los tirantes de la espalda.',
    createdAt: '2026-11-01',
  },
];

export const USER_1_INVENTORY_IDS = [
  1, 2, 3, 4, 8, 9, 10, 11,
  12, 13, 14, 15,
  20, 21, 22, 23, 24, 25, 26,
  30, 31, 32, 33, 34, 35, 36, 37,
  40, 41, 42, 43, 44, 45, 46,
  50, 51, 52, 53, 54, 56, 57, 58,
  110, 111, 112, 113, 114, 115, 117, 118,
];

// Manejador reactivo de almacenamiento local
class MockDataStore {
  private categories: Category[];
  private assets: Asset[];
  private rules: IncompatibilityRule[];
  private outfits: OutfitResponseDto[] = [];

  constructor() {
    this.categories = [...INITIAL_CATEGORIES];
    this.assets = [...INITIAL_ASSETS];
    this.rules = [...INITIAL_RULES];
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  setDefaultAsset(catId: number, assetId: number): Category {
    const cat = this.categories.find((c) => c.id === catId);
    const asset = this.assets.find((a) => a.id === assetId);
    if (!cat || !asset) throw new Error('Categoría o activo no encontrado');
    cat.defaultAssetId = asset.id;
    cat.defaultAssetName = asset.name;
    cat.defaultAssetSpriteUrl = asset.spriteUrl;
    return { ...cat };
  }

  getAssets(filter?: { categoryId?: number; status?: string; query?: string }): Asset[] {
    return this.assets.filter((a) => {
      if (filter?.categoryId && a.categoryId !== filter.categoryId) return false;
      if (filter?.status && a.status !== filter.status) return false;
      if (filter?.query && filter.query.trim().length > 0) {
        const q = filter.query.toLowerCase().trim();
        const inName = a.name.toLowerCase().includes(q);
        const inTags = a.tags?.some((t) => t.toLowerCase().includes(q));
        if (!inName && !inTags) return false;
      }
      return true;
    });
  }

  toggleAssetStatus(assetId: number, status: 'ACTIVE' | 'INACTIVE'): Asset {
    const asset = this.assets.find((a) => a.id === assetId);
    if (!asset) throw new Error('Activo no encontrado');
    if (status === 'INACTIVE' && asset.isDefault) {
      throw new Error('Conflicto de Fallback: No se puede desactivar el activo predeterminado de la categoría.');
    }
    asset.status = status;
    return { ...asset };
  }

  saveAsset(data: any, spriteUrl?: string): Asset {
    const newId = Math.max(...this.assets.map((a) => a.id), 0) + 1;
    const cat = this.categories.find((c) => c.id === data.categoryId);
    const finalSprite = spriteUrl || SPRITE_CAP_BLACK;
    const newAsset: Asset = {
      id: newId,
      categoryId: data.categoryId,
      categoryCode: cat?.code || 'accesorios',
      categoryName: cat?.name || 'Accesorios',
      name: data.name,
      spriteUrl: finalSprite,
      thumbnailUrl: finalSprite,
      zIndex: data.zIndex !== undefined && data.zIndex !== null ? data.zIndex : (cat?.zIndexDefault || 70),
      tags: data.tags || [],
      status: 'ACTIVE',
      isDefault: false,
      supportsTint: !!data.supportsTint,
      obtainable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.assets.push(newAsset);
    return { ...newAsset };
  }

  updateAsset(id: number, data: any, spriteUrl?: string): Asset {
    const asset = this.assets.find((a) => a.id === id);
    if (!asset) throw new Error(`Activo no encontrado con ID: ${id}`);
    const cat = this.categories.find((c) => c.id === data.categoryId);

    asset.categoryId = data.categoryId;
    if (cat) {
      asset.categoryCode = cat.code;
      asset.categoryName = cat.name;
    }
    asset.name = data.name;
    asset.zIndex = data.zIndex !== undefined && data.zIndex !== null ? data.zIndex : (cat?.zIndexDefault || 70);
    asset.tags = data.tags || [];
    asset.supportsTint = !!data.supportsTint;
    if (data.isDefault !== undefined) {
      asset.isDefault = !!data.isDefault;
    }
    if (spriteUrl) {
      asset.spriteUrl = spriteUrl;
      asset.thumbnailUrl = spriteUrl;
    }
    asset.updatedAt = new Date().toISOString();

    return { ...asset };
  }

  getRules(): IncompatibilityRule[] {
    return [...this.rules];
  }

  createRule(assetAId: number, assetBId: number, reason: string): IncompatibilityRule {
    const lowerId = Math.min(assetAId, assetBId);
    const higherId = Math.max(assetAId, assetBId);

    const exists = this.rules.some((r) => r.assetAId === lowerId && r.assetBId === higherId);
    if (exists) throw new Error('Ya existe una regla de incompatibilidad activa entre estos dos activos.');

    const a = this.assets.find((item) => item.id === lowerId);
    const b = this.assets.find((item) => item.id === higherId);
    if (!a || !b) throw new Error('Activo no encontrado');

    const newRule: IncompatibilityRule = {
      id: Math.max(...this.rules.map((r) => r.id), 0) + 1,
      assetAId: a.id,
      assetAName: a.name,
      assetACategoryId: a.categoryId,
      assetACategoryName: a.categoryName,
      assetASpriteUrl: a.spriteUrl,
      assetBId: b.id,
      assetBName: b.name,
      assetBCategoryId: b.categoryId,
      assetBCategoryName: b.categoryName,
      assetBSpriteUrl: b.spriteUrl,
      reason: reason || `Incompatibilidad entre ${a.name} y ${b.name}`,
      createdAt: new Date().toISOString(),
    };
    this.rules.unshift(newRule);
    return newRule;
  }

  deleteRule(ruleId: number): void {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  getCatalogAssets(params?: { categoryCode?: string; query?: string; availableOnly?: boolean }): CatalogAsset[] {
    return this.assets
      .filter((a) => a.status === 'ACTIVE')
      .filter((a) => {
        if (params?.categoryCode && a.categoryCode !== params.categoryCode) return false;
        if (params?.query && params.query.trim().length > 0) {
          const q = params.query.toLowerCase().trim();
          const inName = a.name.toLowerCase().includes(q);
          const inTags = a.tags?.some((t) => t.toLowerCase().includes(q));
          if (!inName && !inTags) return false;
        }
        return true;
      })
      .map((a) => ({
        id: a.id,
        categoryId: a.categoryId,
        categoryCode: a.categoryCode,
        categoryName: a.categoryName,
        name: a.name,
        spriteUrl: a.spriteUrl,
        thumbnailUrl: a.thumbnailUrl,
        zIndex: a.zIndex,
        tags: a.tags,
        isDefault: a.isDefault,
        supportsTint: a.supportsTint,
        isEquipable: true,
        acquisitionType: a.isDefault ? 'DEFAULT' : 'UNLOCKED',
      }));
  }

  saveOutfit(manifest: OutfitManifestDto): OutfitResponseDto {
    const outfit: OutfitResponseDto = {
      id: this.outfits.length + 1,
      userId: 1,
      name: manifest.name,
      skinColor: manifest.skinColor,
      manifest: manifest,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.outfits.unshift(outfit);
    return outfit;
  }
}

export const mockStore = new MockDataStore();
