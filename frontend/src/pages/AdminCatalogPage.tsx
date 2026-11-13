import React, { useState, useEffect } from 'react';
import { Asset, AssetFormData, Category } from '../types/catalog';
import { IncompatibilityRule, IncompatibilityRuleFormData } from '../types/incompatibility';
import { adminCatalogApi } from '../services/adminCatalogApi';
import { adminIncompatibilityApi } from '../services/adminIncompatibilityApi';

interface AdminCatalogPageProps {
  onNavigateToEditor?: () => void;
}

export const AdminCatalogPage: React.FC<AdminCatalogPageProps> = ({ onNavigateToEditor }) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'rules'>('catalog');
  const [categories, setCategories] = useState<Category[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rules, setRules] = useState<IncompatibilityRule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de la tabla
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Slide-over drawer para edición / creación
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'create'>('edit');

  // Estado del formulario de edición en el drawer
  const [formName, setFormName] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formZIndex, setFormZIndex] = useState<number>(10);
  const [formSupportsTint, setFormSupportsTint] = useState<boolean>(false);
  const [formRgbR, setFormRgbR] = useState<number>(255);
  const [formRgbG, setFormRgbG] = useState<number>(255);
  const [formRgbB, setFormRgbB] = useState<number>(255);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [formSpriteFile, setFormSpriteFile] = useState<File | null>(null);
  const [formSpritePreview, setFormSpritePreview] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Modal para nueva regla de incompatibilidad
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [ruleAssetAId, setRuleAssetAId] = useState<number>(0);
  const [ruleAssetBId, setRuleAssetBId] = useState<number>(0);
  const [ruleReason, setRuleReason] = useState<string>('Colisión visual entre piezas');

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, assetsResp, rulesResp] = await Promise.all([
        adminCatalogApi.getCategories(),
        adminCatalogApi.getAssets({
          categoryId: selectedCategoryId || undefined,
          query: searchQuery || undefined,
        }),
        adminIncompatibilityApi.getRules(),
      ]);
      setCategories(cats);
      setAssets(assetsResp.content || []);
      setRules(rulesResp || []);
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el Backoffice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategoryId, searchQuery]);

  const openEditDrawer = (asset: Asset) => {
    setDrawerMode('edit');
    setEditingAsset(asset);
    setFormName(asset.name);
    setFormCategoryId(asset.categoryId);
    setFormZIndex(asset.zIndex);
    setFormSupportsTint(asset.supportsTint);
    setFormRgbR(255);
    setFormRgbG(255);
    setFormRgbB(255);
    setFormStatus(asset.status);
    setFormIsDefault(asset.isDefault);
    setFormSpritePreview(asset.spriteUrl);
    setFormSpriteFile(null);
    setIsDrawerOpen(true);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setEditingAsset(null);
    setFormName('');
    setFormCategoryId(categories[0]?.id || 1);
    setFormZIndex(10);
    setFormSupportsTint(false);
    setFormRgbR(255);
    setFormRgbG(255);
    setFormRgbB(255);
    setFormStatus('ACTIVE');
    setFormIsDefault(false);
    setFormSpritePreview('');
    setFormSpriteFile(null);
    setIsDrawerOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.clearRect(0, 0, 512, 512);
          const scale = Math.min(512 / img.width, 512 / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const offsetX = (512 - drawW) / 2;
          const offsetY = (512 - drawH) / 2;

          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);

          canvas.toBlob((blob) => {
            if (blob) {
              const normalizedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: 'image/png' });
              setFormSpriteFile(normalizedFile);
              setFormSpritePreview(canvas.toDataURL('image/png'));
            }
          }, 'image/png');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);

      const parsedZIndex = Number(formZIndex);
      const safeZIndex = isNaN(parsedZIndex) || parsedZIndex === 0 ? 10 : parsedZIndex;

      const formData: AssetFormData = {
        name: formName || 'Sin nombre',
        categoryId: formCategoryId || 1,
        zIndex: safeZIndex,
        supportsTint: !!formSupportsTint,
        isDefault: !!formIsDefault,
        obtainable: true,
        tags: formName ? [formName.toLowerCase().replace(/\s+/g, '-')] : [],
        status: formStatus || 'ACTIVE',
      };

      if (drawerMode === 'edit' && editingAsset) {
        await adminCatalogApi.updateAsset(editingAsset.id, formData, formSpriteFile || undefined);
        if (formIsDefault && formCategoryId) {
          await adminCatalogApi.setDefaultAsset(formCategoryId, editingAsset.id);
        }
      } else {
        if (!formSpriteFile && !formSpritePreview) {
          alert('Debe seleccionar un archivo de sprite.');
          return;
        }
        await adminCatalogApi.createAsset(formData, formSpriteFile || ({} as File));
      }

      setIsDrawerOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (asset: Asset) => {
    const newStatus = asset.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (newStatus === 'INACTIVE') {
      const confirmDeactivation = window.confirm(
        `¿Desea desactivar lógicamente el activo "${asset.name}"? Los outfits guardados que contengan esta pieza la sustituirán automáticamente por la pieza predeterminada (Fallback).`
      );
      if (!confirmDeactivation) return;
    }

    try {
      await adminCatalogApi.toggleStatus(asset.id, newStatus);
      await loadData();
    } catch (err: any) {
      alert(`Error al cambiar estado: ${err.message}`);
    }
  };

  // NUEVA FUNCIÓN PARA ELIMINAR ACTIVOS
  const handleDeleteAsset = async (asset: Asset) => {
    const confirmDelete = window.confirm(
      `¿Estás completamente seguro de que deseas eliminar la pieza "${asset.name}"? Esta acción no se puede deshacer.`
    );

    if (!confirmDelete) return;

    try {
      await adminCatalogApi.deleteAsset(asset.id);
      alert('¡Pieza eliminada exitosamente!');
      await loadData();
    } catch (err: any) {
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleAssetAId || !ruleAssetBId || ruleAssetAId === ruleAssetBId) {
      alert('Seleccione dos piezas distintas.');
      return;
    }
    try {
      await adminIncompatibilityApi.createRule({
        assetAId: Number(ruleAssetAId),
        assetBId: Number(ruleAssetBId),
        reason: ruleReason,
      });
      setIsRuleModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (window.confirm('¿Eliminar esta regla de incompatibilidad?')) {
      await adminIncompatibilityApi.deleteRule(ruleId);
      await loadData();
    }
  };

  // Filtrado de activos
  const filteredAssets = assets.filter((a) => {
    if (selectedStatus === 'ACTIVE' && a.status !== 'ACTIVE') return false;
    if (selectedStatus === 'INACTIVE' && a.status !== 'INACTIVE') return false;
    return true;
  });

  const activeAssetsCount = assets.filter((a) => a.status === 'ACTIVE').length;
  const categoriesCount = categories.length;

  return (
    <div className="h-full flex overflow-hidden bg-[#FAF9FD] text-[#252137]">
      {/* BARRA LATERAL IZQUIERDA */}
      <aside className="w-64 bg-white border-r border-[#E5E3ED] flex flex-col justify-between p-4 shrink-0">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] font-black tracking-widest text-stone-600 uppercase px-3 block mb-3">
              ESPACIO DE GESTIÓN
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('catalog')}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'catalog'
                  ? 'bg-[#EEE7FF] text-[#7446E8] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
              >
                <span>📦</span>
                <span>Catálogo de piezas</span>
              </button>

              <button
                onClick={() => setActiveTab('rules')}
                className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 ${activeTab === 'rules'
                  ? 'bg-[#EEE7FF] text-[#7446E8] shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
              >
                <span>⚙️</span>
                <span>Categorías y reglas</span>
              </button>

              {onNavigateToEditor && (
                <button
                  onClick={onNavigateToEditor}
                  className="w-full text-left p-3 rounded-2xl text-xs font-bold text-stone-600 hover:text-[#7446E8] hover:bg-stone-50 transition-all flex items-center gap-2.5 mt-2"
                >
                  <span>↗</span>
                  <span>Ir al editor de avatar</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tarjeta de sugerencia */}
        <div className="bg-[#FEF9E7] border border-[#FDE68A] rounded-2xl p-4 text-xs text-[#8C6D1F] space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-black">
            <span>💡</span>
            <span>Todo en su sitio.</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#975A16]">
            Cada pieza tiene una capa. El Z-index define qué va delante.
          </p>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">

          {/* VISTA 1: CATÁLOGO DE PIEZAS */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
                    ADMINISTRACIÓN / CATÁLOGO MAESTRO
                  </span>
                  <h1 className="text-3xl font-black text-[#252137] tracking-tight">
                    Las piezas de la personalidad.
                  </h1>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    Gestiona sprites, capas y disponibilidad desde un mismo lugar.
                  </p>
                </div>

                <button
                  onClick={openCreateDrawer}
                  className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-5 py-2.5 text-xs shadow-md shadow-[#7446E8]/30 flex items-center gap-2 transition-all active:scale-95"
                >
                  <span>+</span>
                  <span>Nuevo activo</span>
                </button>
              </div>

              {/* Tarjetas KPI */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#EBF8FF] border border-[#BEE3F8] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="text-2xl font-black text-[#2B6CB0]">{assets.length}</div>
                  <div className="text-xs font-bold text-[#2B6CB0]">piezas en el catálogo</div>
                </div>

                <div className="bg-[#FAF5FF] border border-[#E9D8FD] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="text-2xl font-black text-[#6B46C1]">{activeAssetsCount}</div>
                  <div className="text-xs font-bold text-[#6B46C1]">activas en el editor</div>
                </div>

                <div className="bg-[#FEFCBF] border border-[#FAF089] rounded-2xl p-4 flex items-center gap-3.5 shadow-2xs">
                  <div className="text-2xl font-black text-[#975A16]">{categoriesCount}</div>
                  <div className="text-xs font-bold text-[#975A16]">categorías de cosméticos</div>
                </div>
              </div>

              {/* Barra de Filtros */}
              <div className="bg-white border border-[#E5E3ED] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative w-72">
                    <input
                      type="text"
                      placeholder="Buscar por nombre, ID o etiqueta... /"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl pl-8 pr-4 py-2 text-xs text-stone-700 placeholder-stone-400 outline-none focus:border-[#7446E8]"
                    />
                    <span className="absolute left-2.5 top-2.5 text-stone-400 text-xs">🔍</span>
                  </div>

                  <select
                    value={selectedCategoryId || ''}
                    onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                    className="bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-[#7446E8]"
                  >
                    <option value="">Todas las categorías ⌄</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 outline-none focus:border-[#7446E8]"
                  >
                    <option value="ALL">Todos los estados ⌄</option>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Baja lógica</option>
                  </select>
                </div>

                <div className="text-xs font-bold text-stone-500">
                  {filteredAssets.length} resultados
                </div>
              </div>

              {/* Tabla de Activos */}
              <div className="bg-white border border-[#E5E3ED] rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9FD] border-b border-[#E5E3ED] text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Sprite</th>
                      <th className="py-3 px-4">Nombre / ID</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Z</th>
                      <th className="py-3 px-4">Fallback</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E3ED]/60 font-medium text-stone-700">
                    {filteredAssets.map((asset) => {
                      const isSelected = editingAsset?.id === asset.id && isDrawerOpen;
                      return (
                        <tr
                          key={asset.id}
                          className={`transition-colors ${isSelected ? 'bg-[#F4EFFF]' : 'hover:bg-stone-50/70'}`}
                        >
                          <td className="py-2.5 px-4">
                            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-[#E5E3ED] flex items-center justify-center p-1">
                              <img
                                src={asset.thumbnailUrl || asset.spriteUrl}
                                alt={asset.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-4">
                            <div className="font-bold text-[#252137]">{asset.name}</div>
                            <div className="text-[10px] text-stone-600 font-mono">ID #{String(asset.id).padStart(3, '0')}</div>
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-stone-600">{asset.categoryName}</td>
                          <td className="py-2.5 px-4 font-mono font-bold text-stone-800">{asset.zIndex}</td>
                          <td className="py-2.5 px-4">
                            {asset.isDefault ? (
                              <span className="bg-[#FEF9E7] text-[#8C6D1F] border border-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-md">
                                Predet.
                              </span>
                            ) : (
                              <span className="text-stone-300">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(asset)}
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full transition-all cursor-pointer ${asset.status === 'ACTIVE'
                                ? 'bg-[#E6F4EA] text-[#137333] hover:bg-emerald-200'
                                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                }`}
                            >
                              {asset.status === 'ACTIVE' ? 'Activo' : 'Baja'}
                            </button>
                          </td>
                          <td className="py-2.5 px-4 text-center space-x-2">
                            <button
                              onClick={() => openEditDrawer(asset)}
                              className={`w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs transition-all ${isSelected
                                ? 'bg-[#7446E8] text-white shadow-xs'
                                : 'bg-stone-100 hover:bg-[#EEE7FF] text-stone-600 hover:text-[#7446E8]'
                                }`}
                              title="Editar pieza"
                            >
                              ✎
                            </button>

                            {/* BOTÓN DE ELIMINAR AÑADIDO */}
                            <button
                              onClick={() => handleDeleteAsset(asset)}
                              className="w-7 h-7 rounded-lg inline-flex items-center justify-center text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 transition-all"
                              title="Eliminar pieza"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISTA 2: CATEGORÍAS Y REGLAS */}
          {activeTab === 'rules' && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-stone-600 uppercase block mb-1">
                    ADMINISTRACIÓN / CATEGORÍAS Y REGLAS
                  </span>
                  <h1 className="text-3xl font-black text-[#252137] tracking-tight">
                    Un sistema. Siete posibilidades.
                  </h1>
                  <p className="text-xs text-stone-500 font-medium mt-1">
                    Organiza las capas, sus piezas predeterminadas y las combinaciones permitidas.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('catalog')}
                  className="border border-[#E5E3ED] bg-white text-[#252137] hover:bg-stone-50 font-bold rounded-xl px-5 py-2 text-xs flex items-center gap-2 shadow-2xs transition-all"
                >
                  <span>↗</span>
                  <span>Ver catálogo</span>
                </button>
              </div>

              <div className="bg-[#FEF9E7] border border-[#FDE68A] text-[#8C6D1F] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <span className="text-base">🛡</span>
                  <div>
                    <h4 className="text-xs font-black text-[#8C6D1F]">Que ningún avatar se quede a medias.</h4>
                    <p className="text-[11px] text-[#975A16] mt-0.5">Al dar de baja una pieza equipada, su fallback la sustituye automáticamente en los avatares guardados.</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold bg-white/70 px-3 py-1 rounded-xl border border-[#FDE68A] shrink-0">2 de 7 con fallback</span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-base font-black text-[#252137]">Categorías y piezas predeterminadas</h2>
                  <span className="text-[11px] text-stone-600">Una pieza de respaldo por categoría</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map((cat) => {
                    const hasFallback = !!cat.defaultAssetId;
                    return (
                      <div
                        key={cat.id}
                        className="bg-white border border-[#E5E3ED] rounded-2xl p-4 flex flex-col justify-between shadow-2xs hover:border-purple-300 transition-all"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <div className="w-9 h-9 rounded-xl bg-stone-50 border border-[#E5E3ED] flex items-center justify-center p-1">
                              {cat.defaultAssetSpriteUrl ? (
                                <img src={cat.defaultAssetSpriteUrl} alt={cat.name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <span className="text-sm">📁</span>
                              )}
                            </div>
                            <span className="text-stone-400 hover:text-stone-700 cursor-pointer text-sm font-bold">•••</span>
                          </div>

                          <h3 className="font-black text-sm text-[#252137]">{cat.name}</h3>
                          <div className="text-[10px] text-stone-600 font-mono mt-0.5">ID {String(cat.id).padStart(2, '0')} · Z-index {cat.zIndexDefault}</div>

                          <div className="mt-3">
                            <label className="text-[9px] font-black uppercase text-stone-600 tracking-wider block mb-1">PIEZA PREDETERMINADA / FALLBACK</label>
                            <div className="bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-2.5 py-1.5 text-xs text-stone-700 flex justify-between items-center">
                              <span className="line-clamp-1 font-semibold">{cat.defaultAssetName || 'Sin asignar'}</span>
                              <span className="text-stone-400 text-xs">⌄</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#E5E3ED]/60 flex justify-between items-center text-[10px]">
                          <span className={`font-bold flex items-center gap-1 ${hasFallback ? 'text-emerald-600' : 'text-amber-600'}`}>
                            <span>●</span>
                            <span>{hasFallback ? 'Protegida' : 'Pendiente'}</span>
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCategoryId(cat.id);
                              setActiveTab('catalog');
                            }}
                            className="font-bold text-[#7446E8] hover:underline"
                          >
                            {hasFallback ? 'Cambiar fallback ↗' : 'Asignar fallback ↗'}
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <div className="bg-[#F3EEFF] border border-[#DEDCE7] rounded-2xl p-4 flex flex-col justify-between text-[#252137] shadow-2xs">
                    <div>
                      <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-[#7446E8] text-base mb-2 font-black">📚</div>
                      <h3 className="font-black text-sm text-[#252137]">Todo por capas.</h3>
                      <p className="text-[11px] leading-relaxed text-stone-600 mt-2">Un Z-index más alto coloca la pieza delante. El cuerpo es la base; los accesorios van al final.</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-purple-200/60 font-mono text-[11px] font-black text-[#7446E8]">10 · 20 · 25 · 35 · 40 · 50 · 70</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E3ED]">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-[#252137]">Incompatibilidades</h2>
                      <span className="bg-[#EEE7FF] text-[#7446E8] font-bold text-[10px] px-2.5 py-0.5 rounded-full">{rules.length} reglas activas</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">Evita que dos piezas que se solapan se equipen al mismo tiempo.</p>
                  </div>

                  <button
                    onClick={() => setIsRuleModalOpen(true)}
                    className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md shadow-[#7446E8]/30 flex items-center gap-1.5 transition-all"
                  >
                    <span>+</span>
                    <span>Nueva regla</span>
                  </button>
                </div>

                <div className="bg-white border border-[#E5E3ED] rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF9FD] border-b border-[#E5E3ED] text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Pieza A</th>
                        <th className="py-3 px-4">No se puede combinar con</th>
                        <th className="py-3 px-4">Comportamiento</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E3ED]/60 font-medium text-stone-700">
                      {rules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-stone-50/70">
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#252137]">{rule.assetAName}</div>
                            <div className="text-[10px] text-stone-600">{rule.assetACategoryName} · #{String(rule.assetAId).padStart(3, '0')}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-[#252137] flex items-center gap-1.5">
                              <span className="text-purple-600">⚡</span>
                              <span>{rule.assetBName}</span>
                            </div>
                            <div className="text-[10px] text-stone-600">{rule.assetBCategoryName} · #{String(rule.assetBId).padStart(3, '0')}</div>
                          </td>
                          <td className="py-3 px-4 text-stone-600">Bloquear combinación</td>
                          <td className="py-3 px-4">
                            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[10px] px-2.5 py-0.5 rounded-full">Activa</span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-stone-400 hover:text-rose-600 text-sm transition-colors"
                              title="Eliminar regla"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* DRAWER DE EDICIÓN */}
        {isDrawerOpen && (
          <div className="w-96 bg-white border-l border-[#E5E3ED] shadow-2xl flex flex-col justify-between p-6 z-40 shrink-0 animate-slideLeft">
            <div className="space-y-5 overflow-y-auto pr-1">
              <div className="flex justify-between items-center pb-3 border-b border-[#E5E3ED]">
                <h3 className="text-lg font-black text-[#252137]">{drawerMode === 'edit' ? 'Editar pieza' : 'Nueva pieza'}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="text-stone-400 hover:text-stone-800 text-lg font-bold">✕</button>
              </div>

              <div className="bg-[#FBFBFE] border border-[#E5E3ED] rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-[#E5E3ED] flex items-center justify-center p-1 shrink-0 shadow-2xs">
                  {formSpritePreview ? (
                    <img src={formSpritePreview} alt="Sprite Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-stone-300 text-xs">Sin sprite</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#252137] truncate">{formName || 'sprite_archivo.png'}</div>
                  <div className="text-[10px] text-stone-600 mt-0.5">PNG · 512 × 512 px · Lienzo unificado</div>
                  <label className="text-[10px] font-bold text-[#7446E8] hover:underline cursor-pointer block mt-1">
                    Reemplazar sprite ↗
                    <input type="file" accept="image/png,image/svg+xml" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {editingAsset && (
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-stone-600 font-bold">ID #{String(editingAsset.id).padStart(3, '0')}</span>
                  <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[10px] px-2.5 py-0.5 rounded-full">● Activo</span>
                </div>
              )}

              <form onSubmit={handleSaveDrawer} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-stone-700 mb-1">Nombre de la pieza</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#7446E8]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 mb-1">Categoría</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => {
                        const newCatId = Number(e.target.value);
                        setFormCategoryId(newCatId);
                        const c = categories.find((cat) => cat.id === newCatId);
                        if (c) setFormZIndex(c.zIndexDefault);
                      }}
                      className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-2.5 py-2 text-xs text-stone-800 outline-none focus:border-[#7446E8]"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 mb-1">Z-index</label>
                    <input
                      type="number"
                      required
                      value={formZIndex}
                      onChange={(e) => setFormZIndex(Number(e.target.value))}
                      className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs text-stone-800 outline-none focus:border-[#7446E8]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-stone-700 block">Activo en el editor</span>
                      <span className="text-[10px] text-stone-600 font-normal">Desactivar aplica una baja lógica.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formStatus === 'ACTIVE'}
                      onChange={(e) => setFormStatus(e.target.checked ? 'ACTIVE' : 'INACTIVE')}
                      className="w-4 h-4 accent-[#7446E8]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsDefault}
                      onChange={(e) => setFormIsDefault(e.target.checked)}
                      className="w-4 h-4 accent-[#7446E8]"
                    />
                    <span className="text-stone-700 text-xs">Usar como fallback de {categories.find((c) => c.id === formCategoryId)?.name}</span>
                  </label>
                </div>

                <div className="bg-[#FEF9E7] border border-[#FDE68A] text-[#8C6D1F] p-3 rounded-xl text-[11px] leading-relaxed">
                  ⓘ El fallback sustituye esta categoría cuando una pieza equipada se desactiva.
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-[#E5E3ED] flex items-center justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveDrawer}
                disabled={isSaving}
                className="bg-[#7446E8] hover:bg-[#6335D7] text-white font-bold rounded-xl px-5 py-2 text-xs shadow-md shadow-[#7446E8]/30 transition-all disabled:opacity-60"
              >
                {isSaving ? 'Guardando...' : '✓ Guardar cambios'}
              </button>
            </div>
          </div>
        )}

        {/* MODAL DE REGLA */}
        {isRuleModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 border-2 border-[#252137] max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-base font-black text-[#252137]">Nueva regla de incompatibilidad</h3>
              <p className="text-xs text-stone-500">Selecciona dos piezas que no se pueden equipar al mismo tiempo.</p>

              <form onSubmit={handleCreateRule} className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Pieza A</label>
                  <select
                    value={ruleAssetAId}
                    onChange={(e) => setRuleAssetAId(Number(e.target.value))}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                    required
                  >
                    <option value="0">Seleccionar pieza A...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.categoryName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Pieza B (Incompatible)</label>
                  <select
                    value={ruleAssetBId}
                    onChange={(e) => setRuleAssetBId(Number(e.target.value))}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                    required
                  >
                    <option value="0">Seleccionar pieza B...</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>{a.name} ({a.categoryName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">Motivo</label>
                  <input
                    type="text"
                    value={ruleReason}
                    onChange={(e) => setRuleReason(e.target.value)}
                    className="w-full bg-[#FAF9FD] border border-[#E5E3ED] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRuleModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-[#7446E8] text-white font-bold rounded-xl px-5 py-2 text-xs shadow-md"
                  >
                    Crear regla
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};