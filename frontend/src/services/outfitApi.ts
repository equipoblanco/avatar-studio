import { OutfitManifestDto, OutfitResponseDto, EquipmentValidationResultDto } from '../types/outfit';
import { mockStore } from './mockDataStore';

const API_BASE = '/api/v1/outfits';

export const outfitApi = {
  async saveOutfit(manifest: OutfitManifestDto, userId: number = 1): Promise<OutfitResponseDto> {
    try {
      const res = await fetch(`${API_BASE}?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
      if (res.ok) return await res.json();
      const err = await res.json().catch(() => ({}));
      if (err.message) throw new Error(err.message);
    } catch (e: any) {
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
      // Fallback local
    }
    return mockStore.saveOutfit(manifest);
  },

  async validateOutfit(manifest: OutfitManifestDto, userId: number = 1): Promise<EquipmentValidationResultDto> {
    try {
      const res = await fetch(`${API_BASE}/validate?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return {
      valid: true,
      errors: [],
      warnings: [],
    };
  },

  async getUserOutfits(userId: number = 1): Promise<OutfitResponseDto[]> {
    try {
      const res = await fetch(`${API_BASE}?userId=${userId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return [];
  },
};
