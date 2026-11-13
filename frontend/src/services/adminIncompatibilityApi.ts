import {
  CompatibilityCheckResponse,
  IncompatibilityRule,
  IncompatibilityRuleFormData,
} from '../types/incompatibility';
import { mockStore } from './mockDataStore';

const API_BASE = '/api/v1/admin/incompatibility-rules';

export const adminIncompatibilityApi = {
  async getRules(): Promise<IncompatibilityRule[]> {
    try {
      const res = await fetch(API_BASE);
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.getRules();
  },

  async createRule(data: IncompatibilityRuleFormData): Promise<IncompatibilityRule> {
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }
    return mockStore.createRule(data.assetAId, data.assetBId, data.reason);
  },

  async deleteRule(id: number): Promise<void> {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) return;
    } catch {
      // Fallback local
    }
    mockStore.deleteRule(id);
  },

  async checkCompatibility(assetIds: number[]): Promise<CompatibilityCheckResponse> {
    try {
      const res = await fetch(`${API_BASE}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback local
    }

    const rules = mockStore.getRules();
    const conflicts = [];
    for (const rule of rules) {
      if (assetIds.includes(rule.assetAId) && assetIds.includes(rule.assetBId)) {
        conflicts.push({
          ruleId: rule.id,
          assetAId: rule.assetAId,
          assetAName: rule.assetAName,
          assetBId: rule.assetBId,
          assetBName: rule.assetBName,
          message: `Conflicto visual [CA-03]: '${rule.assetAName}' es incompatible con '${rule.assetBName}'. Motivo: ${rule.reason}`,
        });
      }
    }

    return {
      compatible: conflicts.length === 0,
      conflicts,
    };
  },
};
