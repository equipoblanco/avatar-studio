import { Asset, AssetFormData, AssetStatus, Category } from '../types/catalog';
import { mockStore } from './mockDataStore';

const API_BASE = '/api/v1/admin';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const adminCatalogApi = {
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

  async setDefaultAsset(categoryId: number, defaultAssetId: number): Promise<Category> {
    try {
      const res = await fetch(`${API_BASE}/categories/${categoryId}/default-asset`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultAssetId }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.setDefaultAsset(categoryId, defaultAssetId);
  },

  async getAssets(params?: { categoryId?: number; status?: AssetStatus; query?: string; page?: number }): Promise<{ content: Asset[]; totalPages: number; totalElements: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.categoryId) queryParams.set('categoryId', params.categoryId.toString());
      if (params?.status) queryParams.set('status', params.status);
      if (params?.query) queryParams.set('query', params.query);
      if (params?.page !== undefined) queryParams.set('page', params.page.toString());

      const res = await fetch(`${API_BASE}/assets?${queryParams.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.content) && data.content.length >= 40) {
          return data;
        }
      }
    } catch {
      // Fallback local
    }
    const filtered = mockStore.getAssets({
      categoryId: params?.categoryId,
      status: params?.status,
      query: params?.query,
    });
    return {
      content: filtered,
      totalPages: 1,
      totalElements: filtered.length,
    };
  },

  async createAsset(data: AssetFormData, file: File): Promise<Asset> {
    let spriteDataUrl: string | undefined = undefined;
    try {
      spriteDataUrl = await fileToDataUrl(file);
    } catch (e) {
      console.warn('Error convirtiendo archivo a DataURL:', e);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append(
        'data',
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );

      const res = await fetch(`${API_BASE}/assets`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const created = await res.json();
        mockStore.saveAsset(data, created.spriteUrl || spriteDataUrl);
        return created;
      }
    } catch {
      // Fallback local
    }
    return mockStore.saveAsset(data, spriteDataUrl);
  },

  async updateAsset(id: number, data: AssetFormData, file?: File): Promise<Asset> {
    let spriteDataUrl: string | undefined = undefined;
    if (file) {
      try {
        spriteDataUrl = await fileToDataUrl(file);
      } catch (e) {
        console.warn('Error convirtiendo archivo a DataURL:', e);
      }
    }

    try {
      const formData = new FormData();
      if (file) formData.append('file', file);
      formData.append(
        'data',
        new Blob([JSON.stringify(data)], { type: 'application/json' })
      );

      const res = await fetch(`${API_BASE}/assets/${id}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        mockStore.updateAsset(id, data, updated.spriteUrl || spriteDataUrl);
        return updated;
      }
    } catch {
      // Fallback local
    }
    return mockStore.updateAsset(id, data, spriteDataUrl);
  },

  async toggleStatus(id: number, newStatus: AssetStatus): Promise<Asset> {
    try {
      const res = await fetch(`${API_BASE}/assets/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.toggleAssetStatus(id, newStatus);
  },
};
