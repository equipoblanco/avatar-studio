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
      if (res.ok) return await res.json();
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
      if (res.ok) return await res.json();
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
    const formData = new FormData();
    formData.append('file', file);

    // Enviamos los datos campo por campo (Spring Boot los juntará con @ModelAttribute)
    formData.append('name', data.name);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('zIndex', data.zIndex.toString());
    formData.append('supportsTint', String(data.supportsTint));
    formData.append('isDefault', String(data.isDefault));
    formData.append('obtainable', String(data.obtainable));

    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach(tag => formData.append('tags', tag));
    }

    const res = await fetch(`${API_BASE}/assets`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error ${res.status}: ${errorText}`);
    }
    return await res.json();
  },


  async updateAsset(id: number, data: AssetFormData, file?: File): Promise<Asset> {
    const formData = new FormData();

    // 1. Si hay archivo nuevo, lo enviamos
    if (file) {
      formData.append('file', file);
    }

    // 2. Enviamos los datos campo por campo (igual que en createAsset)
    formData.append('name', data.name);
    formData.append('categoryId', data.categoryId.toString());
    formData.append('zIndex', data.zIndex.toString());
    formData.append('supportsTint', String(data.supportsTint));
    formData.append('isDefault', String(data.isDefault));
    formData.append('obtainable', String(data.obtainable));

    if (data.tags && Array.isArray(data.tags)) {
      data.tags.forEach(tag => formData.append('tags', tag));
    }

    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Error al actualizar: ${res.status} - ${errorText}`);
    }
    return await res.json();
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

  async deleteAsset(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/assets/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Error al eliminar el activo');
    }
  },
};
