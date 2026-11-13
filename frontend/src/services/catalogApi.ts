import { Category, CatalogAsset } from '../types/catalog';

const API_BASE = '/api/catalog';

export const catalogApi = {
  async getCategories(): Promise<Category[]> {
    try {
      const res = await fetch(`${API_BASE}/categories`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error('Error al cargar categorías reales:', e);
    }
    return []; // Si falla, devolvemos array vacío (adiós al mock)
  },

  async getCatalogAssets(params?: {
    categoryId?: number;
    categoryCode?: string;
    query?: string;
    userId?: number;
    availableOnly?: boolean;
  }): Promise<CatalogAsset[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.categoryId) queryParams.set('categoryId', params.categoryId.toString());
      if (params?.categoryCode) queryParams.set('categoryCode', params.categoryCode);
      if (params?.query && params.query.trim().length > 0) queryParams.set('query', params.query.trim());
      if (params?.userId) queryParams.set('userId', params.userId.toString());
      if (params?.availableOnly !== undefined) queryParams.set('availableOnly', params.availableOnly.toString());

      const res = await fetch(`${API_BASE}/assets?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return data; // Devolvemos exactamente lo que diga Java (si está vacío, será vacío)
      }
    } catch (e) {
      console.error('Error al cargar activos reales:', e);
    }
    return []; // Si falla, devolvemos array vacío (adiós al mock)
  },
};