import React, { useState, useEffect } from 'react';
import { Category, CatalogAsset } from '../types/catalog';
import { IncompatibilityRule } from '../types/incompatibility';
import { catalogApi } from '../services/catalogApi';
import { adminIncompatibilityApi } from '../services/adminIncompatibilityApi';
import { outfitApi } from '../services/outfitApi';
import { EditorCatalogPanel } from '../components/EditorCatalogPanel';
import {
  ToonixPreviewer,
  EyeStyle,
  MouthStyle,
  BodyPatternType,
} from '../components/ToonixPreviewer';
import {
  AVATAR_BASE_COLORS,
  WII_PATTERNS,
  PatternIconSvg,
} from '../components/WiiStyleComponents';

export type OfficialCategoryCode =
  | 'cuerpo_base'
  | 'rostro'
  | 'peinado'
  | 'ropa_superior'
  | 'ropa_inferior'
  | 'calzado'
  | 'accesorios';

interface CategoryNavTab {
  id: OfficialCategoryCode;
  label: string;
  icon: React.ReactNode;
}

const CATEGORY_NAV_TABS: CategoryNavTab[] = [
  {
    id: 'cuerpo_base',
    label: 'Cuerpo',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="5" r="2.5" />
        <path d="M7 21v-7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v7" />
        <path d="M12 12v9" />
      </svg>
    ),
  },
  {
    id: 'rostro',
    label: 'Rostro',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M9 10h.01M15 10h.01" strokeWidth="3" />
        <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
      </svg>
    ),
  },
  {
    id: 'peinado',
    label: 'Cabello',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <circle cx="6" cy="18" r="3" />
        <line x1="20" y1="4" x2="8.12" y2="15.88" />
        <line x1="14.47" y1="14.48" x2="20" y2="20" />
        <line x1="8.12" y1="8.12" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    id: 'ropa_superior',
    label: 'Superior',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.5a2 2 0 0 0 1.97 1.67H7v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9h2.17a2 2 0 0 0 1.97-1.67l.58-3.5a2 2 0 0 0-1.34-2.23z" />
      </svg>
    ),
  },
  {
    id: 'ropa_inferior',
    label: 'Inferior',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 4h14v7l-2 9h-3l-2-7-2 7H7l-2-9V4z" />
      </svg>
    ),
  },
  {
    id: 'calzado',
    label: 'Zapatos',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 17a4 4 0 0 0 4 4h12a2 2 0 0 0 2-2v-3a4 4 0 0 0-4-4h-3l-2-4H7a4 4 0 0 0-4 4v5z" />
        <path d="M7 13h4" />
      </svg>
    ),
  },
  {
    id: 'accesorios',
    label: 'Accesorios',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="14" r="4" />
        <circle cx="18" cy="14" r="4" />
        <line x1="10" y1="14" x2="14" y2="14" />
        <path d="M6 10l2-6M18 10l-2-6" />
      </svg>
    ),
  },
];

// 12 Opciones de bocas ricas y expresivas para el avatar
const MOUTH_OPTIONS: { id: MouthStyle; label: string }[] = [
  { id: 'neutral', label: 'Neutral' },
  { id: 'smile',   label: 'Sonrisa' },
  { id: 'teeth',   label: 'Dientes' },
  { id: 'open',    label: 'Asombro' },
  { id: 'smirk',   label: 'Pícara' },
  { id: 'tongue',  label: 'Lengua' },
  { id: 'frown',   label: 'Seria' },
  { id: 'laugh',   label: 'Carcajada' },
  { id: 'whistle', label: 'Silbido' },
  { id: 'cat',     label: 'Gatito' },
  { id: 'fangs',   label: 'Colmillos' },
  { id: 'wavy',    label: 'Ondulada' },
];

const EYE_OPTIONS: { id: EyeStyle; label: string }[] = [
  { id: 'classic', label: 'Clásicos' },
  { id: 'round',   label: 'Curiosos' },
  { id: 'happy',   label: 'Felices' },
  { id: 'wink',    label: 'Sonrientes' },
  { id: 'angry',   label: 'Desafiantes' },
  { id: 'cartoon', label: 'Sorprendidos' },
  { id: 'star',    label: 'Estrella' },
  { id: 'sleepy',  label: 'Relajados' },
];

export const CIRCLE_BG_PALETTE = [
  { name: 'Cian Toonix', hex: '#A0E7E5' },
  { name: 'Amarillo Sol', hex: '#FDE047' },
  { name: 'Rosa Pastel', hex: '#F472B6' },
  { name: 'Lila Suave', hex: '#C084FC' },
  { name: 'Azul Cielo', hex: '#93C5FD' },
  { name: 'Verde Menta', hex: '#86EFAC' },
  { name: 'Melocotón', hex: '#FED7AA' },
  { name: 'Blanco Nieve', hex: '#FFFFFF' },
  { name: 'Gris Claro', hex: '#E2E8F0' },
  { name: 'Noche Oscura', hex: '#252137' },
];

interface AvatarStudioEditorPageProps {
  onNavigateToAdmin?: () => void;
}

export const AvatarStudioEditorPage: React.FC<AvatarStudioEditorPageProps> = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [incompatibilityRules, setIncompatibilityRules] = useState<IncompatibilityRule[]>([]);
  const [equippedAssets, setEquippedAssets] = useState<Record<string, CatalogAsset | null>>({});

  // Color de piel en Base
  const [skinColor, setSkinColor] = useState<string>('#FFFFFF');
  const [bodyPattern, setBodyPattern] = useState<BodyPatternType>('none');

  // Color de fondo del círculo detrás del muñeco Toonix
  const [circleBgColor, setCircleBgColor] = useState<string>('#A0E7E5');

  // Expresiones faciales
  const [eyesStyle, setEyesStyle] = useState<EyeStyle>('classic');
  const [mouthStyle, setMouthStyle] = useState<MouthStyle>('neutral');

  // Pestaña activa
  const [activeTab, setActiveTab] = useState<OfficialCategoryCode>('rostro');

  // Nombre del avatar
  const [outfitName, setOutfitName] = useState<string>('mi_avatar');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(true);

  // Zoom del visor
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initEditor = async () => {
      try {
        setLoading(true);
        const [cats, rules] = await Promise.all([
          catalogApi.getCategories(),
          adminIncompatibilityApi.getRules(),
        ]);
        setCategories(cats);
        setIncompatibilityRules(rules);

        // Estado inicial de las ranuras: estrictamente limpio
        const allAssets = await catalogApi.getCatalogAssets({ availableOnly: true });
        const baseAsset =
          allAssets.find((a) => a.categoryCode === 'cuerpo_base' && a.isDefault) ||
          allAssets.find((a) => a.categoryCode === 'cuerpo_base') ||
          null;

        const initialEquipped: Record<string, CatalogAsset | null> = {
          cuerpo_base: baseAsset,
          rostro: null,
          peinado: null,
          ropa_superior: null,
          ropa_inferior: null,
          calzado: null,
          accesorios: null,
        };
        setEquippedAssets(initialEquipped);
      } catch (err) {
        console.error('Error al inicializar editor:', err);
      } finally {
        setLoading(false);
      }
    };
    initEditor();
  }, []);

  const handleEquipAsset = (categoryCode: string, asset: CatalogAsset) => {
    setEquippedAssets((prev) => ({
      ...prev,
      [categoryCode]: asset,
    }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
    setFeedbackError(null);
  };

  const handleUnequipAsset = (categoryCode: string) => {
    const cat = categories.find((c) => c.code === categoryCode);
    if (cat?.isRequired) {
      alert(`La ranura '${cat.name}' es obligatoria para la silueta del avatar.`);
      return;
    }
    setEquippedAssets((prev) => ({
      ...prev,
      [categoryCode]: null,
    }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
    setFeedbackError(null);
  };

  const handleRandomize = async () => {
    try {
      const allAssets = await catalogApi.getCatalogAssets({ availableOnly: true });
      const availableHairs = allAssets.filter((a) => a.categoryCode === 'peinado');
      const availableTops = allAssets.filter((a) => a.categoryCode === 'ropa_superior');
      const availableBottoms = allAssets.filter((a) => a.categoryCode === 'ropa_inferior');
      const availableShoes = allAssets.filter((a) => a.categoryCode === 'calzado');
      const availableAccs = allAssets.filter((a) => a.categoryCode === 'accesorios');

      const pickRandom = (arr: CatalogAsset[]) => (arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null);

      const eyesList: EyeStyle[] = ['classic', 'cartoon', 'wink', 'happy', 'angry', 'round', 'star', 'sleepy'];
      const mouthList: MouthStyle[] = [
        'neutral', 'smile', 'teeth', 'open', 'smirk', 'tongue',
        'frown', 'laugh', 'whistle', 'cat', 'fangs', 'wavy',
      ];
      const skinList = AVATAR_BASE_COLORS.map((c) => c.hex);

      setEyesStyle(eyesList[Math.floor(Math.random() * eyesList.length)]);
      setMouthStyle(mouthList[Math.floor(Math.random() * mouthList.length)]);
      setSkinColor(skinList[Math.floor(Math.random() * skinList.length)]);

      setEquippedAssets((prev) => ({
        ...prev,
        peinado: pickRandom(availableHairs),
        ropa_superior: pickRandom(availableTops),
        ropa_inferior: pickRandom(availableBottoms),
        calzado: pickRandom(availableShoes),
        accesorios: Math.random() > 0.4 ? pickRandom(availableAccs) : null,
      }));
      setHasUnsavedChanges(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleReset = () => {
    setEquippedAssets((prev) => ({
      cuerpo_base: prev.cuerpo_base,
      rostro: null,
      peinado: null,
      ropa_superior: null,
      ropa_inferior: null,
      calzado: null,
      accesorios: null,
    }));
    setSkinColor('#FFFFFF');
    setBodyPattern('none');
    setEyesStyle('classic');
    setMouthStyle('neutral');
    setHasUnsavedChanges(true);
  };

  const handleSaveOutfit = async () => {
    try {
      setIsSaving(true);
      setFeedbackError(null);

      const slotsPayload: Record<string, { assetId: number; zIndex?: number }> = {};
      for (const [code, asset] of Object.entries(equippedAssets)) {
        if (asset) {
          slotsPayload[code] = {
            assetId: asset.id,
            zIndex: asset.zIndex,
          };
        }
      }

      await outfitApi.saveOutfit({
        name: outfitName.trim() || 'mi_avatar',
        skinColor: skinColor,
        slots: slotsPayload,
      });

      setSaveSuccess(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setFeedbackError(err.message || 'Error al persistir el avatar en la base de datos');
    } finally {
      setIsSaving(false);
    }
  };

  const isRostro = activeTab === 'rostro';
  const pageHeadline = isRostro ? 'Ponle tu mejor cara.' : 'Hazlo a tu manera.';
  const pageSubtitle = isRostro
    ? 'Un gesto lo cambia todo. Combina ojos y bocas a tu estilo.'
    : 'Mezcla, prueba y crea un avatar que sea tan único como tú.';

  const activeTabObj = CATEGORY_NAV_TABS.find((t) => t.id === activeTab);
  const activeCategoryName = activeTabObj?.label || 'Rostro';

  return (
    <div className="h-full w-full overflow-hidden bg-[#FAF9FD] text-[#252137] flex flex-col px-6 py-4 select-none">
      <div className="w-full max-w-7xl mx-auto h-full flex flex-col gap-4 min-h-0">

        {/* ENCABEZADO SUPERIOR: TITULAR + PESTAÑAS LIMPIAS ALINEADAS A LA DERECHA */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-[#252137] tracking-tight">
              {pageHeadline}
            </h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              {pageSubtitle}
            </p>
          </div>

          {/* Pestañas de las 7 Categorías Oficiales */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {CATEGORY_NAV_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-[78px] h-[72px] rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#7446E8] text-white border-2 border-[#252137] shadow-[2px_2px_0px_#252137]'
                      : 'bg-white border border-[#E5E3ED] text-[#252137] hover:border-purple-300 hover:bg-stone-50 shadow-2xs'
                  }`}
                >
                  <div>{tab.icon}</div>
                  <span className="text-[10px] font-bold leading-tight line-clamp-1">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENEDOR PRINCIPAL: 2 COLUMNAS (IZQUIERDA: AVATAR CARD, DERECHA: SELECCIÓN) */}
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">

          {/* =====================================================================
              COLUMNA IZQUIERDA: TARJETA DEL AVATAR CON CÍRCULO CIAN (#A0E7E5)
              ===================================================================== */}
          <div className="lg:col-span-5 h-full flex flex-col justify-between bg-white border-2 border-[#252137] rounded-3xl p-5 shadow-sm">
            {/* Lienzo del Avatar con fondo circular suave personalizable */}
            <div className="flex-1 min-h-[280px] flex flex-col items-center justify-center relative overflow-hidden">
              {/* Círculo de fondo más grande y centrado para que quepan cabellos y gorros sin salirse */}
              <div
                className="w-[285px] h-[285px] rounded-full absolute flex items-center justify-center transition-colors duration-300 border-2 border-[#252137]/10 shadow-inner pointer-events-none"
                style={{ backgroundColor: circleBgColor }}
              />

              {/* Contenedor del Avatar escalado */}
              <div
                className="relative z-10 w-[240px] h-[240px] flex items-center justify-center transition-transform"
                style={{ transform: `scale(${zoomLevel / 100})` }}
              >
                <ToonixPreviewer
                  skinColorHex={skinColor}
                  bodyPattern={bodyPattern}
                  categoryCode={activeTab}
                  eyesStyle={eyesStyle}
                  mouthStyle={mouthStyle}
                  width={240}
                  height={240}
                  showPedestal={false}
                />

                {/* Superposición estricta de capas equipadas */}
                {Object.values(equippedAssets)
                  .filter(
                    (a): a is CatalogAsset =>
                      a !== null &&
                      a.categoryCode !== 'cuerpo_base' &&
                      !(a.categoryCode === 'rostro' && a.isDefault)
                  )
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((item) => (
                    <img
                      key={item.id}
                      src={item.spriteUrl}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      style={{ zIndex: item.zIndex }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                    />
                  ))}
              </div>
            </div>

            {/* Selector de color para personalizar el fondo circular del avatar */}
            <div className="flex items-center justify-center gap-1.5 py-2 px-1 shrink-0">
              {CIRCLE_BG_PALETTE.map((color) => {
                const isSelected = circleBgColor.toLowerCase() === color.hex.toLowerCase();
                return (
                  <button
                    key={color.hex}
                    type="button"
                    title={color.name}
                    onClick={() => setCircleBgColor(color.hex)}
                    className={`w-5 h-5 rounded-md transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#252137] scale-110 shadow-xs ring-2 ring-purple-300'
                        : 'border border-stone-300 hover:border-stone-500 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                );
              })}
            </div>

            {/* Barra de Controles del Visor (Aleatorio, Zoom, Reset) */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E5E3ED]/60 shrink-0">
              <button
                type="button"
                onClick={handleRandomize}
                className="border border-[#E5E3ED] bg-white rounded-xl px-3.5 py-1.5 text-xs font-bold text-[#252137] flex items-center gap-1.5 hover:bg-stone-50 shadow-2xs transition-all active:scale-95"
              >
                <span>🎲</span>
                <span>Aleatorio</span>
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-stone-600 bg-stone-50 px-2.5 py-1 rounded-xl border border-[#E5E3ED]">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(70, z - 10))}
                  className="hover:text-stone-900 px-1"
                >
                  −
                </button>
                <span>{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                  className="hover:text-stone-900 px-1"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleReset}
                title="Reiniciar avatar al estado base"
                className="border border-[#E5E3ED] bg-white w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-[#252137] hover:bg-stone-50 shadow-2xs transition-all active:scale-95"
              >
                ↺
              </button>
            </div>

            {/* SECCIÓN INFERIOR: NOMBRE DE TU AVATAR + BOTÓN GUARDAR */}
            <div className="mt-4 pt-3 border-t border-[#E5E3ED] space-y-2.5 shrink-0">
              <div className="flex justify-between items-center text-[11px] font-bold text-stone-600">
                <span>Nombre de tu avatar</span>
                <span className="text-stone-400 font-mono">{outfitName.length} / 24</span>
              </div>

              <input
                type="text"
                maxLength={24}
                value={outfitName}
                onChange={(e) => {
                  setOutfitName(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="w-full bg-[#FBFBFE] border border-[#E5E3ED] rounded-xl px-4 py-2.5 text-xs font-semibold text-[#252137] outline-none focus:border-[#7446E8] focus:ring-2 focus:ring-[#7446E8]/20 transition-all shadow-inner"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      hasUnsavedChanges ? 'bg-[#7446E8] animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span className={hasUnsavedChanges ? 'text-[#7446E8]' : 'text-emerald-700'}>
                    {hasUnsavedChanges ? 'Cambios sin guardar' : 'Guardado'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSaveOutfit}
                  disabled={isSaving}
                  className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-6 py-2.5 text-xs shadow-md shadow-[#7446E8]/30 transition-all active:scale-95 disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <span>Guardando...</span>
                  ) : (
                    <>
                      <span>✓</span>
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================================
              COLUMNA DERECHA: PANEL DE CATÁLOGO / EXPRESIONES / PIEZAS (LIMPIO)
              ===================================================================== */}
          <div className="lg:col-span-7 h-full flex flex-col bg-white border-2 border-[#252137] rounded-3xl p-6 shadow-sm min-h-0 overflow-hidden">

            {/* Cabecera Limpia del Panel */}
            <div className="pb-3 border-b border-[#E5E3ED] shrink-0">
              <h2 className="text-xl font-black text-[#252137]">
                {activeCategoryName}
              </h2>
            </div>

            {/* Área de Opciones con Scroll Aislado */}
            <div className="flex-1 min-h-0 overflow-y-auto py-3 pr-1 scrollbar-thin scrollbar-thumb-stone-200">

              {/* 1. VISTA: ROSTRO (OJOS Y LAS 12 BOCAS EXPRESIVAS) */}
              {activeTab === 'rostro' && (
                <div className="space-y-6">
                  {/* Buscador de expresiones */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar ojos o bocas... /"
                      className="w-full bg-[#FBFBFE] border border-[#E5E3ED] rounded-xl px-4 py-2.5 text-xs text-stone-600 placeholder-stone-400 outline-none focus:border-[#7446E8]"
                    />
                  </div>

                  {/* Sección 1: Ojos */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#252137]">
                        <span>👁</span>
                        <span>Ojos</span>
                      </div>
                      <span className="text-[11px] font-semibold text-stone-500 capitalize">
                        {eyesStyle}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {EYE_OPTIONS.map((item) => {
                        const isSelected = eyesStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setEyesStyle(item.id);
                              setHasUnsavedChanges(true);
                            }}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative aspect-[4/3] ${
                              isSelected
                                ? 'bg-[#EEE7FF] border-2 border-[#7446E8] shadow-xs'
                                : 'bg-[#F7F6FB] border border-[#DEDCE7] hover:border-purple-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#7446E8] text-white text-[10px] font-black flex items-center justify-center absolute top-2 right-2 shadow-xs">
                                ✓
                              </div>
                            )}

                            {/* Expresión de Ojos */}
                            <div className="h-7 flex items-center justify-center">
                              {item.id === 'classic' && (
                                <div className="flex gap-4">
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#252137]" />
                                  <span className="w-2.5 h-2.5 rounded-full bg-[#252137]" />
                                </div>
                              )}
                              {item.id === 'round' && (
                                <div className="flex gap-4">
                                  <span className="w-2.5 h-3.5 rounded-full bg-[#252137]" />
                                  <span className="w-2.5 h-3.5 rounded-full bg-[#252137]" />
                                </div>
                              )}
                              {item.id === 'happy' && (
                                <div className="flex gap-4 text-base font-black text-[#252137]">
                                  <span>^</span>
                                  <span>^</span>
                                </div>
                              )}
                              {item.id === 'wink' && (
                                <div className="flex gap-4 text-base font-black text-[#252137]">
                                  <span>^</span>
                                  <span>^</span>
                                </div>
                              )}
                              {item.id === 'angry' && (
                                <div className="flex gap-4">
                                  <span className="w-3.5 h-1.5 bg-[#252137] rotate-12 rounded-sm" />
                                  <span className="w-3.5 h-1.5 bg-[#252137] -rotate-12 rounded-sm" />
                                </div>
                              )}
                              {item.id === 'cartoon' && (
                                <div className="flex gap-4">
                                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#252137]" />
                                  <span className="w-2.5 h-2.5 rounded-full border-2 border-[#252137]" />
                                </div>
                              )}
                              {item.id === 'star' && (
                                <div className="flex gap-3 text-xs text-[#252137]">
                                  <span>★</span>
                                  <span>★</span>
                                </div>
                              )}
                              {item.id === 'sleepy' && (
                                <div className="flex gap-3">
                                  <span className="w-3.5 h-1 bg-[#252137] rounded-sm" />
                                  <span className="w-3.5 h-1 bg-[#252137] rounded-sm" />
                                </div>
                              )}
                            </div>

                            <span className="text-[11px] font-bold text-[#252137] mt-2">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sección 2: Bocas (12 OPCIONES DE BOCAS RICAS Y VARIADAS) */}
                  <div>
                    <div className="flex justify-between items-center mb-2.5">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#252137]">
                        <span>😊</span>
                        <span>Bocas</span>
                      </div>
                      <span className="text-[11px] font-semibold text-stone-500 capitalize">
                        {mouthStyle}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {MOUTH_OPTIONS.map((item) => {
                        const isSelected = mouthStyle === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setMouthStyle(item.id);
                              setHasUnsavedChanges(true);
                            }}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer relative aspect-[4/3] ${
                              isSelected
                                ? 'bg-[#EEE7FF] border-2 border-[#7446E8] shadow-xs'
                                : 'bg-[#F7F6FB] border border-[#DEDCE7] hover:border-purple-300'
                            }`}
                          >
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-[#7446E8] text-white text-[10px] font-black flex items-center justify-center absolute top-2 right-2 shadow-xs">
                                ✓
                              </div>
                            )}

                            {/* Expresión de Boca SVG */}
                            <div className="h-7 flex items-center justify-center">
                              {item.id === 'neutral' && (
                                <div className="w-6 h-1 bg-[#252137] rounded-full" />
                              )}
                              {item.id === 'smile' && (
                                <div className="w-6 h-3 border-b-3 border-[#252137] rounded-b-full" />
                              )}
                              {item.id === 'teeth' && (
                                <div className="w-6 h-3 rounded-md border-2 border-[#252137]" />
                              )}
                              {item.id === 'open' && (
                                <div className="w-3.5 h-4 bg-[#252137] rounded-full" />
                              )}
                              {item.id === 'smirk' && (
                                <div className="w-6 h-2 border-b-3 border-[#252137] rounded-br-full rotate-6" />
                              )}
                              {item.id === 'tongue' && (
                                <div className="relative flex flex-col items-center">
                                  <div className="w-5 h-2 border-b-2 border-[#252137] rounded-b-full" />
                                  <div className="w-3 h-2.5 bg-rose-500 rounded-b-md -mt-0.5" />
                                </div>
                              )}
                              {item.id === 'frown' && (
                                <div className="w-6 h-3 border-t-3 border-[#252137] rounded-t-full mt-1" />
                              )}
                              {item.id === 'laugh' && (
                                <div className="w-6 h-3.5 bg-[#252137] rounded-b-full relative overflow-hidden">
                                  <div className="w-4 h-2 bg-rose-500 rounded-t-full absolute bottom-0 left-1" />
                                </div>
                              )}
                              {item.id === 'whistle' && (
                                <div className="w-2.5 h-2.5 rounded-full bg-[#252137]" />
                              )}
                              {item.id === 'cat' && (
                                <span className="text-xs font-black text-[#252137] tracking-tighter">:3</span>
                              )}
                              {item.id === 'fangs' && (
                                <div className="w-6 h-3 bg-[#252137] rounded-b-full relative flex justify-around px-0.5">
                                  <span className="w-1 h-1.5 bg-white rounded-b-xs" />
                                  <span className="w-1 h-1.5 bg-white rounded-b-xs" />
                                </div>
                              )}
                              {item.id === 'wavy' && (
                                <span className="text-base font-black text-[#252137] leading-none">~</span>
                              )}
                            </div>

                            <span className="text-[11px] font-bold text-[#252137] mt-2">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. VISTA: CUERPO BASE (COLORES SOLOS Y PATRONES) */}
              {activeTab === 'cuerpo_base' && (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#252137] uppercase tracking-wider mb-2">
                      Colores Solos
                    </h4>
                    <div className="grid grid-cols-6 gap-2.5">
                      {AVATAR_BASE_COLORS.map((c) => {
                        const isSelected = skinColor.toLowerCase() === c.hex.toLowerCase();
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSkinColor(c.hex);
                              setHasUnsavedChanges(true);
                            }}
                            title={c.name}
                            className={`aspect-square rounded-2xl transition-all relative flex flex-col items-center justify-center p-2 shadow-xs ${
                              isSelected
                                ? 'border-2 border-[#7446E8] ring-3 ring-[#7446E8]/30 scale-105 shadow-md z-10'
                                : 'border border-[#DEDCE7] hover:border-purple-300'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {isSelected && (
                              <div className="w-4 h-4 rounded-full bg-[#7446E8] text-white text-[9px] font-black flex items-center justify-center absolute top-1 right-1 shadow-xs">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-extrabold text-[#252137] uppercase tracking-wider mb-2">
                      Patrones de Piel
                    </h4>
                    <div className="grid grid-cols-4 gap-2.5">
                      {WII_PATTERNS.map((pat) => {
                        const isSelected = bodyPattern === pat.id;
                        return (
                          <button
                            key={pat.id}
                            type="button"
                            onClick={() => {
                              setBodyPattern(pat.id);
                              setHasUnsavedChanges(true);
                            }}
                            className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all ${
                              isSelected
                                ? 'bg-[#EEE7FF] border-2 border-[#7446E8] shadow-xs'
                                : 'bg-[#F7F6FB] border border-[#DEDCE7] hover:border-purple-300'
                            }`}
                          >
                            <PatternIconSvg pattern={pat.id} className="w-8 h-8" />
                            <span className="text-[10px] font-bold text-[#252137] mt-1 line-clamp-1">
                              {pat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. VISTAS DE PRENDAS Y ACCESORIOS (CABELLO, ROPA SUPERIOR, ROPA INFERIOR, ZAPATOS, ACCESORIOS) */}
              {(activeTab === 'peinado' ||
                activeTab === 'ropa_superior' ||
                activeTab === 'ropa_inferior' ||
                activeTab === 'calzado' ||
                activeTab === 'accesorios') && (
                <EditorCatalogPanel
                  categories={categories}
                  currentCategoryCode={activeTab}
                  equippedAssets={equippedAssets}
                  incompatibilityRules={incompatibilityRules}
                  onEquipAsset={handleEquipAsset}
                  onUnequipAsset={handleUnequipAsset}
                  userId={1}
                />
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
