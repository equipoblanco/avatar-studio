import { Category, CatalogAsset } from '../types/catalog';
import { mockStore } from './mockDataStore';

const API_BASE = '/api/catalog';

export const catalogApi = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) {
        const data: Category[] = await res.json();
        if (data && data.length > 0) {
          return data.map((c) => ({
            ...c,
            name:
              c.code === 'ropa_superior'
                ? 'Superior'
                : c.code === 'ropa_inferior'
                ? 'Inferior'
                : c.name,
          }));
        }
      }
    } catch {
      // Fallback local
    }
    return mockStore.getCategories();
  },

  async getCatalogAssets(params?: {
    categoryId?: number;
    categoryCode?: string;
    query?: string;
    userId?: number;
    availableOnly?: boolean;
  }): Promise<CatalogAsset[]> {
    // Obtenemos la base canónica completa con todos los sprites SVG vectoriales de alta fidelidad
    const mockAssets = mockStore.getCatalogAssets(params);
    const mockMap = new Map<number, CatalogAsset>(mockAssets.map((m) => [m.id, m]));
    const nameMap = new Map<string, CatalogAsset>(
      mockAssets.map((m) => [m.name.toLowerCase().trim(), m])
    );

    try {
      const queryParams = new URLSearchParams();
      if (params?.categoryId) queryParams.set('categoryId', params.categoryId.toString());
      if (params?.categoryCode) queryParams.set('categoryCode', params.categoryCode);
      if (params?.query && params.query.trim().length > 0) queryParams.set('query', params.query.trim());
      if (params?.userId) queryParams.set('userId', params.userId.toString());
      // Para el editor queremos que todas las piezas sean explorables y equipables
      queryParams.set('availableOnly', 'false');

      const res = await fetch(`${API_BASE}/assets?${queryParams.toString()}`);
      if (res.ok) {
        const backendAssets: CatalogAsset[] = await res.json();
        if (Array.isArray(backendAssets) && backendAssets.length > 0) {
          // Si el backend responde, saneamos URLs rotas (ej. cdn.plataforma.com) con los sprites SVG reales
          const enriched = backendAssets.map((b) => {
            const match = mockMap.get(b.id) || nameMap.get(b.name.toLowerCase().trim());
            const isBroken =
              !b.spriteUrl ||
              b.spriteUrl.includes('cdn.plataforma.com') ||
              b.spriteUrl.includes('example.com');

            const finalSprite = isBroken && match ? match.spriteUrl : (b.spriteUrl || match?.spriteUrl || '');
            const finalThumb = isBroken && match ? match.thumbnailUrl : (b.thumbnailUrl || finalSprite);

            return {
              ...b,
              spriteUrl: finalSprite,
              thumbnailUrl: finalThumb,
              categoryName:
                b.categoryCode === 'ropa_superior'
                  ? 'Superior'
                  : b.categoryCode === 'ropa_inferior'
                  ? 'Inferior'
                  : b.categoryName,
              isEquipable: true,
            };
          });

          // Combinar con los activos de mockStore para que ninguna categoría quede vacía
          const existingIds = new Set(enriched.map((e) => e.id));
          const existingNames = new Set(enriched.map((e) => e.name.toLowerCase().trim()));

          for (const m of mockAssets) {
            if (!existingIds.has(m.id) && !existingNames.has(m.name.toLowerCase().trim())) {
              enriched.push(m);
            }
          }

          return enriched;
        }
      }
    } catch {
      // Fallback local
    }

    return mockAssets;
  },
};
