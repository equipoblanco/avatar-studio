import React, { useState, useEffect } from 'react';
import { Asset, AssetFormData, Category } from '../types/catalog';
import { ToonixPreviewer } from './ToonixPreviewer';

interface AssetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AssetFormData, file?: File) => Promise<void>;
  categories: Category[];
  initialAsset?: Asset | null;
}

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialAsset,
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [zIndex, setZIndex] = useState<number>(10);
  const [tagsString, setTagsString] = useState('');
  const [supportsTint, setSupportsTint] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialAsset) {
      setName(initialAsset.name);
      setCategoryId(initialAsset.categoryId);
      setZIndex(initialAsset.zIndex);
      setTagsString(initialAsset.tags ? initialAsset.tags.join(', ') : '');
      setSupportsTint(initialAsset.supportsTint);
      setIsDefault(initialAsset.isDefault);
      setPreviewUrl(initialAsset.spriteUrl);
      setSelectedFile(undefined);
    } else {
      setName('');
      const firstCat = categories[0];
      setCategoryId(firstCat?.id || 1);
      setZIndex(firstCat?.zIndexDefault || 10);
      setTagsString('');
      setSupportsTint(false);
      setIsDefault(false);
      setPreviewUrl(null);
      setSelectedFile(undefined);
    }
    setValidationError(null);
  }, [initialAsset, categories, isOpen]);

  if (!isOpen) return null;

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCatId = Number(e.target.value);
    setCategoryId(newCatId);
    const cat = categories.find((c) => c.id === newCatId);
    if (cat) {
      setZIndex(cat.zIndexDefault);
    }
  };

  // Validación y normalización técnica del sprite (512x512, transparencia)
  const handleFileChange = (file: File) => {
    setValidationError(null);

    if (!['image/png', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      setValidationError('Solo se admiten archivos PNG o WebP con canal de transparencia.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setValidationError('El archivo excede el límite máximo de 2 MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Normalización automática en lienzo 512x512 si las dimensiones son distintas
      if (img.width !== 512 || img.height !== 512) {
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
              setSelectedFile(normalizedFile);
              setPreviewUrl(canvas.toDataURL('image/png'));
            }
          }, 'image/png');
        }
      } else {
        setSelectedFile(file);
        setPreviewUrl(objectUrl);
      }
    };
    img.src = objectUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialAsset && !selectedFile) {
      setValidationError('Debe adjuntar el archivo gráfico del sprite.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          name,
          categoryId,
          zIndex,
          tags,
          supportsTint,
          isDefault,
        },
        selectedFile
      );
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'Error al guardar el activo');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden flex flex-col md:flex-row">
        {/* Columna Izquierda: Previsualizador Toonix en Vivo */}
        <div className="md:w-5/12 bg-stone-100 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200">
          <ToonixPreviewer
            spritePreviewUrl={previewUrl}
            zIndex={zIndex}
            categoryCode={selectedCategory?.code}
            width={280}
            height={280}
          />
          <p className="text-xs text-stone-500 text-center mt-3">
            Comprobación visual de encaje anatómico del avatar.
          </p>
        </div>

        {/* Columna Derecha: Formulario */}
        <div className="md:w-7/12 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-stone-900">
                {initialAsset ? 'Editar Activo Cosmético' : 'Registrar Nuevo Activo 2D'}
              </h3>
              <button onClick={onClose} className="text-stone-400 hover:text-stone-700 text-lg">✕</button>
            </div>

            {validationError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                ⚠️ {validationError}
              </div>
            )}

            <form id="asset-form" onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Gorra Curva Roja"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Categoría (7 Ranuras)</label>
                  <select
                    value={categoryId}
                    onChange={handleCategoryChange}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Z-Index (Profundidad)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    max={100}
                    value={zIndex}
                    onChange={(e) => setZIndex(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">Etiquetas (Separadas por comas)</label>
                <input
                  type="text"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  placeholder="sombrero, rojo, urbano"
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="flex gap-4 items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-800">
                  <input
                    type="checkbox"
                    checked={supportsTint}
                    onChange={(e) => setSupportsTint(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  Soporta Tinte Dinámico RGB
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase mb-1">
                  Sprite 2D ({initialAsset ? 'Opcional si no se reemplaza' : 'Requerido: 512x512 PNG/WebP'})
                </label>
                <input
                  type="file"
                  accept="image/png,image/webp"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                  }}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                />
              </div>
            </form>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="asset-form"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-lg shadow-sm"
            >
              {isSubmitting ? 'Guardando...' : initialAsset ? 'Guardar Cambios' : 'Registrar Activo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

